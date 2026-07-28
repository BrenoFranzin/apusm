import React from "react";


interface Props{

children:React.ReactNode;

variant?:"primary"|"secondary"|"danger";

onClick?:()=>void;

}


export default function Button({

children,

variant="primary",

onClick

}:Props){


const styles={

primary:"bg-green-600 text-white hover:bg-green-700",

secondary:"bg-gray-200 text-gray-800",

danger:"bg-red-600 text-white"

};


return(

<button

onClick={onClick}

className={`px-4 py-2 rounded-lg font-medium transition ${styles[variant]}`}

>

{children}

</button>

)

}
