interface Props{

children:string;

}


export default function Badge({children}:Props){


return(

<span className="
px-3
py-1
rounded-full
text-xs
bg-green-100
text-green-700
">

{children}

</span>

)

}
