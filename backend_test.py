#!/usr/bin/env python3
"""
AutoVerkauf Pro Backend API Test Suite
Tests all backend functionality including rate limiting, authentication, and CRUD operations.
"""

import requests
import time
import json
import sys
from datetime import datetime
from io import BytesIO

class AutoVerkaufAPITester:
    def __init__(self, base_url="https://info-protector-3.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.session = requests.Session()
        self.session.timeout = 30

    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        # Remove Content-Type for file uploads
        if files:
            test_headers.pop('Content-Type', None)

        self.tests_run += 1
        self.log(f"Testing {name}...")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers)
            elif method == 'POST':
                if files:
                    response = self.session.post(url, files=files, headers=test_headers)
                else:
                    response = self.session.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}", "ERROR")
                if response.text:
                    self.log(f"Response: {response.text[:200]}", "ERROR")

            return success, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text

        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}", "ERROR")
            return False, {}

    def test_health_check(self):
        """Test health check endpoint"""
        self.log("=== Testing Health Check ===")
        success, response = self.run_test(
            "Health Check",
            "GET",
            "health",
            200
        )
        if success and isinstance(response, dict):
            self.log(f"Health status: {response.get('status', 'unknown')}")
            self.log(f"Database: {response.get('database', 'unknown')}")
        return success

    def test_rate_limiting_upload(self):
        """Test rate limiting on upload endpoint (30/minute)"""
        self.log("=== Testing Upload Rate Limiting (30/minute) ===")
        
        # Create a small test file
        test_file = BytesIO(b"test image content")
        test_file.name = "test.jpg"
        
        success_count = 0
        rate_limited = False
        
        # Try to make 35 requests quickly to trigger rate limit
        for i in range(35):
            test_file.seek(0)  # Reset file pointer
            files = {'file': ('test.jpg', test_file, 'image/jpeg')}
            
            success, response = self.run_test(
                f"Upload Request {i+1}",
                "POST",
                "upload",
                200 if i < 30 else 429,  # Expect rate limit after 30
                files=files
            )
            
            if success and i < 30:
                success_count += 1
            elif not success and i >= 30:
                rate_limited = True
                self.log(f"Rate limit triggered at request {i+1} ✅")
                break
            
            time.sleep(0.1)  # Small delay between requests
        
        self.log(f"Upload rate limiting test: {success_count} successful uploads, rate limited: {rate_limited}")
        return rate_limited

    def test_rate_limiting_cars(self):
        """Test rate limiting on cars endpoint (10/minute)"""
        self.log("=== Testing Cars Submission Rate Limiting (10/minute) ===")
        
        car_data = {
            "brand": "BMW",
            "model": "320i",
            "first_registration": "2020-01-01",
            "mileage": 50000,
            "fuel_type": "Benzin",
            "transmission": "Automatik",
            "body_type": "Limousine",
            "doors": "4",
            "color": "Schwarz",
            "previous_owners": 1,
            "vin": f"TEST{int(time.time())}",
            "contact": {
                "first_name": "Test",
                "last_name": "User",
                "email": "test@example.com",
                "phone": "+49123456789",
                "city": "Berlin"
            },
            "pricing": {
                "desired_price": 25000,
                "minimum_price": 23000
            }
        }
        
        success_count = 0
        rate_limited = False
        
        # Try to make 15 requests quickly to trigger rate limit
        for i in range(15):
            car_data["vin"] = f"TEST{int(time.time())}{i}"  # Unique VIN
            
            success, response = self.run_test(
                f"Car Submission {i+1}",
                "POST",
                "cars",
                200 if i < 10 else 429,  # Expect rate limit after 10
                data=car_data
            )
            
            if success and i < 10:
                success_count += 1
            elif not success and i >= 10:
                rate_limited = True
                self.log(f"Rate limit triggered at request {i+1} ✅")
                break
            
            time.sleep(0.1)  # Small delay between requests
        
        self.log(f"Cars rate limiting test: {success_count} successful submissions, rate limited: {rate_limited}")
        return rate_limited

    def test_admin_login_rate_limiting(self):
        """Test rate limiting on admin login (5/minute)"""
        self.log("=== Testing Admin Login Rate Limiting (5/minute) ===")
        
        login_data = {
            "username": "admin",
            "password": "wrongpassword"  # Use wrong password to avoid successful logins
        }
        
        rate_limited = False
        
        # Try to make 8 requests quickly to trigger rate limit
        for i in range(8):
            success, response = self.run_test(
                f"Admin Login Attempt {i+1}",
                "POST",
                "admin/login",
                401 if i < 5 else 429,  # Expect rate limit after 5
                data=login_data
            )
            
            if not success and i >= 5:
                rate_limited = True
                self.log(f"Rate limit triggered at request {i+1} ✅")
                break
            
            time.sleep(0.1)  # Small delay between requests
        
        self.log(f"Admin login rate limiting test: rate limited: {rate_limited}")
        return rate_limited

    def test_file_upload_validation(self):
        """Test file upload size validation"""
        self.log("=== Testing File Upload Validation ===")
        
        # Test with oversized file (>10MB)
        large_file = BytesIO(b"x" * (11 * 1024 * 1024))  # 11MB file
        large_file.name = "large_test.jpg"
        
        files = {'file': ('large_test.jpg', large_file, 'image/jpeg')}
        
        success, response = self.run_test(
            "Large File Upload (should fail)",
            "POST",
            "upload",
            400,  # Should return 400 for file too large
            files=files
        )
        
        # Test with invalid file type
        invalid_file = BytesIO(b"test content")
        invalid_file.name = "test.exe"
        
        files = {'file': ('test.exe', invalid_file, 'application/octet-stream')}
        
        success2, response2 = self.run_test(
            "Invalid File Type (should fail)",
            "POST",
            "upload",
            400,  # Should return 400 for invalid file type
            files=files
        )
        
        return success and success2

    def test_admin_login(self):
        """Test admin login with correct credentials"""
        self.log("=== Testing Admin Login ===")
        
        # Wait a bit to avoid rate limiting from previous tests
        time.sleep(2)
        
        login_data = {
            "username": "admin",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Admin Login (correct credentials)",
            "POST",
            "admin/login",
            200,
            data=login_data
        )
        
        if success and isinstance(response, dict) and 'token' in response:
            self.token = response['token']
            self.log(f"Login successful, token received")
            return True
        else:
            self.log("Login failed - no token received", "ERROR")
            return False

    def test_car_submission(self):
        """Test car submission API"""
        self.log("=== Testing Car Submission ===")
        
        car_data = {
            "brand": "Mercedes-Benz",
            "model": "C-Class",
            "variant": "C200",
            "first_registration": "2019-06-15",
            "mileage": 75000,
            "fuel_type": "Benzin",
            "transmission": "Automatik",
            "power_hp": 184,
            "power_kw": 135,
            "engine_size": 1991,
            "body_type": "Limousine",
            "doors": "4",
            "color": "Silber",
            "interior_color": "Schwarz",
            "tuv_until": "2025-06-01",
            "previous_owners": 2,
            "accident_free": True,
            "service_history": True,
            "vin": f"TESTVIN{int(time.time())}",
            "photos": [],
            "documents": [],
            "contact": {
                "first_name": "Max",
                "last_name": "Mustermann",
                "email": "max.mustermann@example.com",
                "phone": "+49171234567",
                "city": "München"
            },
            "pricing": {
                "desired_price": 28500,
                "minimum_price": 26000,
                "competitor_price": 29000,
                "competitor_source": "mobile.de"
            },
            "features": ["Klimaanlage", "Navigation", "Ledersitze"],
            "description": "Sehr gepflegtes Fahrzeug mit Vollausstattung"
        }
        
        success, response = self.run_test(
            "Car Submission",
            "POST",
            "cars",
            200,
            data=car_data
        )
        
        if success and isinstance(response, dict):
            car_id = response.get('id')
            self.log(f"Car submitted successfully with ID: {car_id}")
            return car_id
        return None

    def test_admin_dashboard_apis(self, car_id=None):
        """Test admin dashboard APIs"""
        self.log("=== Testing Admin Dashboard APIs ===")
        
        if not self.token:
            self.log("No admin token available, skipping admin tests", "ERROR")
            return False
        
        # Test admin stats
        success1, response1 = self.run_test(
            "Admin Stats",
            "GET",
            "admin/stats",
            200
        )
        
        if success1:
            self.log(f"Stats: {response1}")
        
        # Test admin cars list
        success2, response2 = self.run_test(
            "Admin Cars List",
            "GET",
            "admin/cars",
            200
        )
        
        if success2 and isinstance(response2, dict):
            cars = response2.get('cars', [])
            self.log(f"Found {len(cars)} cars in admin dashboard")
        
        # Test car detail if we have a car ID
        success3 = True
        if car_id:
            success3, response3 = self.run_test(
                f"Car Detail {car_id}",
                "GET",
                f"admin/cars/{car_id}",
                200
            )
        
        return success1 and success2 and success3

    def test_admin_password_change(self):
        """Test admin password change functionality"""
        self.log("=== Testing Admin Password Change ===")
        
        if not self.token:
            self.log("No admin token available, skipping password change test", "ERROR")
            return False
        
        # Test with wrong current password
        wrong_password_data = {
            "current_password": "wrongpassword",
            "new_password": "newpassword123"
        }
        
        success1, response1 = self.run_test(
            "Password Change (wrong current password)",
            "POST",
            "admin/change-password",
            401,  # Should fail with wrong current password
            data=wrong_password_data
        )
        
        # Test with correct current password
        correct_password_data = {
            "current_password": "admin123",
            "new_password": "newpassword123"
        }
        
        success2, response2 = self.run_test(
            "Password Change (correct current password)",
            "POST",
            "admin/change-password",
            200,
            data=correct_password_data
        )
        
        # Change password back to original
        if success2:
            revert_password_data = {
                "current_password": "newpassword123",
                "new_password": "admin123"
            }
            
            success3, response3 = self.run_test(
                "Revert Password Change",
                "POST",
                "admin/change-password",
                200,
                data=revert_password_data
            )
            
            return success1 and success2 and success3
        
        return success1 and success2

    def test_brands_endpoint(self):
        """Test brands endpoint"""
        self.log("=== Testing Brands Endpoint ===")
        
        success, response = self.run_test(
            "Get Brands",
            "GET",
            "brands",
            200
        )
        
        if success and isinstance(response, dict):
            brands = response.get('brands', [])
            self.log(f"Found {len(brands)} brands")
            return len(brands) > 0
        
        return success

    def test_inventory_settings(self):
        """Test inventory settings endpoints"""
        self.log("=== Testing Inventory Settings ===")
        
        if not self.token:
            self.log("No admin token available, skipping settings tests", "ERROR")
            return False
        
        # Test get settings
        success1, response1 = self.run_test(
            "Get Settings",
            "GET",
            "admin/settings",
            200
        )
        
        # Test update settings with default contact info
        settings_data = {
            "default_contact_name": "AutoVerkauf Pro GmbH",
            "default_contact_phone": "+49 511 123456",
            "default_contact_email": "info@autoverkauf-pro.de",
            "default_contact_address": "Musterstraße 123",
            "default_contact_city": "Hannover",
            "default_contact_zip": "30159"
        }
        
        success2, response2 = self.run_test(
            "Update Settings",
            "PUT",
            "admin/settings",
            200,
            data=settings_data
        )
        
        if success2:
            self.log("✅ Default contact settings saved successfully")
        
        return success1 and success2

    def test_inventory_crud_operations(self):
        """Test complete inventory CRUD operations"""
        self.log("=== Testing Inventory CRUD Operations ===")
        
        if not self.token:
            self.log("No admin token available, skipping inventory tests", "ERROR")
            return False
        
        # Step 1: Create a new inventory vehicle
        vehicle_data = {
            "brand": "BMW",
            "model": "X5",
            "variant": "xDrive40i",
            "title": "BMW X5 xDrive40i - Vollausstattung",
            "first_registration": "03/2021",
            "mileage": 45000,
            "fuel_type": "Benzin",
            "transmission": "Automatik",
            "power_hp": 340,
            "power_kw": 250,
            "engine_size": 2998,
            "cylinders": 6,
            "drive_type": "Allrad",
            "body_type": "SUV",
            "doors": "4/5",
            "seats": 5,
            "exterior_color": "Alpinweiß",
            "interior_color": "Schwarz",
            "interior_material": "Leder",
            "tuv_until": "03/2024",
            "hu_au": "03/2024",
            "accident_free": True,
            "service_history": True,
            "previous_owners": 1,
            "non_smoker": True,
            "garage_kept": True,
            "emission_class": "Euro 6d",
            "environmental_badge": "Grün",
            "co2_emission": 213,
            "fuel_consumption_combined": 9.1,
            "fuel_consumption_city": 11.2,
            "fuel_consumption_highway": 7.8,
            "energy_efficiency": "D",
            "features": [
                "Navigation Professional",
                "Panorama-Glasdach",
                "Harman Kardon Soundsystem",
                "Adaptive LED-Scheinwerfer",
                "Komfortzugang",
                "Rückfahrkamera",
                "Parkassistent",
                "Klimaautomatik 3-Zonen"
            ],
            "photos": [],
            "video_url": None,
            "price": 52900.00,
            "price_negotiable": True,
            "vat_deductible": False,
            "description": "Sehr gepflegter BMW X5 mit Vollausstattung. Das Fahrzeug wurde stets in der Garage geparkt und regelmäßig gewartet. Alle Services wurden bei BMW durchgeführt.",
            "highlights": "Vollausstattung, Scheckheft gepflegt, Nichtraucher",
            "contact_name": None,  # Will use default from settings
            "contact_phone": None,
            "contact_email": None,
            "contact_address": None,
            "contact_city": None,
            "contact_zip": None,
            "is_published": True,
            "is_sold": False,
            "is_reserved": False,
            "featured": True
        }
        
        success1, response1 = self.run_test(
            "Create Inventory Vehicle",
            "POST",
            "admin/inventory",
            200,
            data=vehicle_data
        )
        
        if not success1 or not isinstance(response1, dict):
            self.log("Failed to create inventory vehicle", "ERROR")
            return False
        
        vehicle_id = response1.get('id')
        if not vehicle_id:
            self.log("No vehicle ID returned from creation", "ERROR")
            return False
        
        self.log(f"✅ Vehicle created successfully with ID: {vehicle_id}")
        
        # Step 2: Check vehicle appears in public inventory list
        success2, response2 = self.run_test(
            "Get Public Inventory List",
            "GET",
            "inventory",
            200
        )
        
        vehicle_found_in_list = False
        if success2 and isinstance(response2, dict):
            vehicles = response2.get('vehicles', [])
            self.log(f"Found {len(vehicles)} vehicles in public inventory")
            for vehicle in vehicles:
                if vehicle.get('id') == vehicle_id:
                    vehicle_found_in_list = True
                    self.log(f"✅ Vehicle {vehicle_id} found in public list")
                    break
        
        # Step 3: Get vehicle details from public endpoint
        success3, response3 = self.run_test(
            f"Get Public Vehicle Detail {vehicle_id}",
            "GET",
            f"inventory/{vehicle_id}",
            200
        )
        
        if success3 and isinstance(response3, dict):
            self.log(f"✅ Vehicle details retrieved: {response3.get('brand')} {response3.get('model')} - {response3.get('price')}€")
        
        # Step 4: Update vehicle (change price)
        update_data = {
            "price": 49900.00,
            "description": "Sehr gepflegter BMW X5 mit Vollausstattung. PREISREDUZIERT! Das Fahrzeug wurde stets in der Garage geparkt und regelmäßig gewartet."
        }
        
        success4, response4 = self.run_test(
            f"Update Vehicle {vehicle_id}",
            "PUT",
            f"admin/inventory/{vehicle_id}",
            200,
            data=update_data
        )
        
        if success4:
            self.log(f"✅ Vehicle price updated to {update_data['price']}€")
        
        # Step 5: Verify update by getting vehicle details again
        success5, response5 = self.run_test(
            f"Get Updated Vehicle Detail {vehicle_id}",
            "GET",
            f"admin/inventory/{vehicle_id}",
            200
        )
        
        price_updated = False
        if success5 and isinstance(response5, dict):
            updated_price = response5.get('price')
            if updated_price == update_data['price']:
                price_updated = True
                self.log(f"✅ Price update verified: {updated_price}€")
        
        # Step 6: Check inventory statistics
        success6, response6 = self.run_test(
            "Get Inventory Statistics",
            "GET",
            "admin/inventory-stats",
            200
        )
        
        if success6 and isinstance(response6, dict):
            stats = response6
            self.log(f"✅ Inventory Stats - Total: {stats.get('total')}, Published: {stats.get('published')}, Sold: {stats.get('sold')}")
        
        # Step 7: Test admin inventory list
        success7, response7 = self.run_test(
            "Get Admin Inventory List",
            "GET",
            "admin/inventory",
            200
        )
        
        vehicle_found_in_admin_list = False
        if success7 and isinstance(response7, dict):
            vehicles = response7.get('vehicles', [])
            self.log(f"Found {len(vehicles)} vehicles in admin inventory")
            for vehicle in vehicles:
                if vehicle.get('id') == vehicle_id:
                    vehicle_found_in_admin_list = True
                    break
        
        # Step 8: Delete the vehicle (cleanup)
        success8, response8 = self.run_test(
            f"Delete Vehicle {vehicle_id}",
            "DELETE",
            f"admin/inventory/{vehicle_id}",
            200
        )
        
        if success8:
            self.log(f"✅ Vehicle {vehicle_id} deleted successfully")
        
        # Step 9: Verify deletion
        success9, response9 = self.run_test(
            f"Verify Vehicle Deleted {vehicle_id}",
            "GET",
            f"inventory/{vehicle_id}",
            404  # Should return 404 after deletion
        )
        
        if success9:
            self.log(f"✅ Vehicle deletion verified - returns 404")
        
        # Return overall success
        all_tests = [success1, success2, vehicle_found_in_list, success3, success4, 
                    success5, price_updated, success6, success7, vehicle_found_in_admin_list, 
                    success8, success9]
        
        return all(all_tests)

    def test_inventory_filtering_and_search(self):
        """Test inventory filtering and search functionality"""
        self.log("=== Testing Inventory Filtering and Search ===")
        
        # Test public inventory with filters
        success1, response1 = self.run_test(
            "Get Inventory with Brand Filter",
            "GET",
            "inventory?brand=BMW&sort=price_asc&limit=10",
            200
        )
        
        success2, response2 = self.run_test(
            "Get Inventory with Price Filter",
            "GET",
            "inventory?price_min=20000&price_max=50000&sort=newest",
            200
        )
        
        success3, response3 = self.run_test(
            "Get Inventory with Search",
            "GET",
            "inventory?search=BMW&fuel_type=Benzin",
            200
        )
        
        if success1 and isinstance(response1, dict):
            self.log(f"✅ Brand filter test: Found {len(response1.get('vehicles', []))} BMW vehicles")
        
        if success2 and isinstance(response2, dict):
            self.log(f"✅ Price filter test: Found {len(response2.get('vehicles', []))} vehicles in price range")
        
        if success3 and isinstance(response3, dict):
            self.log(f"✅ Search test: Found {len(response3.get('vehicles', []))} vehicles matching search")
            filters = response3.get('filters', {})
            self.log(f"Available filters - Brands: {len(filters.get('brands', []))}, Fuel types: {len(filters.get('fuel_types', []))}")
        
        return success1 and success2 and success3

    def run_all_tests(self):
        """Run all backend tests"""
        self.log("🚀 Starting AutoVerkauf Pro Backend API Tests")
        self.log(f"Testing against: {self.base_url}")
        
        start_time = time.time()
        
        # Basic functionality tests
        self.test_health_check()
        self.test_brands_endpoint()
        
        # Rate limiting tests (these might take some time)
        self.test_rate_limiting_upload()
        time.sleep(2)  # Wait between rate limit tests
        self.test_rate_limiting_cars()
        time.sleep(2)  # Wait between rate limit tests
        self.test_admin_login_rate_limiting()
        time.sleep(2)  # Wait before admin login
        
        # File validation tests
        self.test_file_upload_validation()
        
        # Admin authentication
        if self.test_admin_login():
            # Car submission test
            car_id = self.test_car_submission()
            
            # Admin dashboard tests
            self.test_admin_dashboard_apis(car_id)
            
            # Password change test
            self.test_admin_password_change()
            
            # NEW: Inventory API tests
            self.test_inventory_settings()
            self.test_inventory_crud_operations()
            self.test_inventory_filtering_and_search()
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Print results
        self.log("=" * 50)
        self.log(f"📊 Test Results Summary")
        self.log(f"Tests run: {self.tests_run}")
        self.log(f"Tests passed: {self.tests_passed}")
        self.log(f"Tests failed: {self.tests_run - self.tests_passed}")
        self.log(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        self.log(f"Duration: {duration:.1f} seconds")
        self.log("=" * 50)
        
        return self.tests_passed == self.tests_run

    def run_inventory_tests_only(self):
        """Run only the inventory API tests"""
        self.log("🚀 Starting Inventory API Tests")
        self.log(f"Testing against: {self.base_url}")
        
        start_time = time.time()
        
        # Basic health check
        self.test_health_check()
        
        # Admin authentication required for inventory tests
        if self.test_admin_login():
            # Run inventory-specific tests
            self.test_inventory_settings()
            self.test_inventory_crud_operations()
            self.test_inventory_filtering_and_search()
        else:
            self.log("❌ Admin login failed - cannot run inventory tests", "ERROR")
            return False
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Print results
        self.log("=" * 50)
        self.log(f"📊 Inventory Test Results Summary")
        self.log(f"Tests run: {self.tests_run}")
        self.log(f"Tests passed: {self.tests_passed}")
        self.log(f"Tests failed: {self.tests_run - self.tests_passed}")
        self.log(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        self.log(f"Duration: {duration:.1f} seconds")
        self.log("=" * 50)
        
        return self.tests_passed == self.tests_run

def main():
    """Main test runner"""
    import sys
    
    # Check if we should run only inventory tests
    if len(sys.argv) > 1 and sys.argv[1] == "inventory":
        tester = AutoVerkaufAPITester()
        success = tester.run_inventory_tests_only()
    else:
        tester = AutoVerkaufAPITester()
        success = tester.run_all_tests()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())