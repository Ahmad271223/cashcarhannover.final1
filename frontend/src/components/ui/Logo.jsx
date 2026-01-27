import React from "react";
import logo from "../../assets/logo.png";

const Logo = ({ className = "w-14 h-14", iconClassName = "w-full h-full p-1", bgClass = "bg-white" }) => {
    return (
        <div className={`${className} ${bgClass} rounded-lg flex items-center justify-center overflow-hidden`}>
            <img src={logo} alt="CashCar Logo" className={`${iconClassName} object-contain`} />
        </div>
    );
};

export default Logo;
