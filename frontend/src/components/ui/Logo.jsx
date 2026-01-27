import React from "react";
import logo from "../../assets/logo.png";

const Logo = ({ className = "w-20 h-20", iconClassName = "w-16 h-16", bgClass = "bg-white" }) => {
    return (
        <div className={`${className} ${bgClass} rounded-lg flex items-center justify-center`}>
            <img src={logo} alt="CashCar Logo" className={`${iconClassName} object-contain`} />
        </div>
    );
};

export default Logo;
