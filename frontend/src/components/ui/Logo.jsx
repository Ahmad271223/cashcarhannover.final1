import React from "react";
import logo from "../../assets/logo.png";

const Logo = ({ className = "w-10 h-10", iconClassName = "w-8 h-8", bgClass = "bg-white" }) => {
    return (
        <div className={`${className} ${bgClass} rounded-lg flex items-center justify-center`}>
            <img src={logo} alt="CashCar Logo" className={`${iconClassName} object-contain`} />
        </div>
    );
};

export default Logo;
