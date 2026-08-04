interface Props{
message:string;
}
export default function EmptyState({
message
}:Props){
return(
<div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
{message}
</div>
)
}