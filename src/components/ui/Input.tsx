interface Props{

label?:string;

placeholder?:string;

}


export default function Input({

label,

placeholder

}:Props){


return(

<div className="flex flex-col gap-2">


{label &&

<label className="text-sm font-medium">

{label}

</label>

}


<input

placeholder={placeholder}

className="
border
rounded-lg
px-3
py-2
focus:ring-2
focus:ring-green-500
outline-none
"

/>


</div>

)

}
