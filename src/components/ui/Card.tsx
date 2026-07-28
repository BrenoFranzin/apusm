import React from "react";


export default function Card({

children

}:{

children:React.ReactNode

}){


return(

<div className="bg-white rounded-xl shadow-sm border p-5">

{children}

</div>

)

}
