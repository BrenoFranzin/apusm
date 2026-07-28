interface Props{

message:string;

}


export default function EmptyState({

message

}:Props){


return(

<div className="text-center p-10 text-gray-500">

{message}

</div>

)

}
