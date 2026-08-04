import React from "react";
export default function Card({
children
}:{
children:React.ReactNode
}){
return(
<div style={{ background: "var(--background-primary)", border: "1px solid var(--border-default)", borderRadius: 12, boxShadow: "var(--shadow-sm)", padding: 20 }}>
{children}
</div>
)
}