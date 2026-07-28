Write-Host "====================================="
Write-Host " APUSM SaaS - Foundation Installer"
Write-Host " Parte 1/3 iniciando..."
Write-Host "====================================="


# ==========================
# Criar pastas
# ==========================

$folders = @(

"src/components/ui",
"src/components/layout",
"src/components/common",

"src/hooks",
"src/services",
"src/routes",
"src/store",
"src/types",
"src/utils",

"src/styles"

)


foreach ($folder in $folders) {

    if (!(Test-Path $folder)) {

        New-Item -ItemType Directory -Path $folder | Out-Null

        Write-Host "Criado: $folder"

    }

}


# ==========================
# Criar Global Types
# ==========================


@'
export interface Pagination {

 page:number;

 limit:number;

 total:number;

}


export interface ApiResponse<T>{

 data:T;

 message?:string;

 success:boolean;

}


export interface SelectOption {

 label:string;

 value:string;

}
'@ | Set-Content "src/types/global.types.ts"



Write-Host "Criado global.types.ts"



# ==========================
# Criar API Service
# ==========================


@'
import axios from "axios";


export const api = axios.create({

 baseURL:
 import.meta.env.VITE_API_URL ||
 "http://localhost:3000",

 timeout:10000,


 headers:{

 "Content-Type":"application/json"

 }

});
'@ | Set-Content "src/services/api.ts"



Write-Host "Criado api.ts"



# ==========================
# Criar Store Global
# ==========================


@'
import {create} from "zustand";


interface AppStore {

 loading:boolean;

 setLoading:(value:boolean)=>void;

}


export const useAppStore=create<AppStore>((set)=>(

{

 loading:false,


 setLoading:(value)=>

 set({

 loading:value

 })

}

));
'@ | Set-Content "src/store/index.ts"



Write-Host "Criado store"



# ==========================
# Criar Theme CSS
# ==========================


@'
:root{


 --primary:#166534;

 --primary-light:#22c55e;

 --background:#f8fafc;

 --card:#ffffff;

 --text:#111827;


}


body{


 margin:0;

 min-height:100vh;

 background:var(--background);

 color:var(--text);

 font-family:

 Inter,

 system-ui,

 sans-serif;


}
'@ | Set-Content "src/styles/theme.css"



Write-Host "Criado theme.css"



# ==========================
# Criar Global CSS
# ==========================


@'
@import "tailwindcss";

@import "./theme.css";
'@ | Set-Content "src/styles/globals.css"



Write-Host "Criado globals.css"



Write-Host "====================================="
Write-Host " PARTE 1/3 FINALIZADA"
Write-Host "====================================="


Write-Host "====================================="
Write-Host " PARTE 2/3 - UI + LAYOUT"
Write-Host "====================================="


# ==========================
# Button
# ==========================

@'
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
'@ | Set-Content "src/components/ui/Button.tsx"



# ==========================
# Card
# ==========================


@'
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
'@ | Set-Content "src/components/ui/Card.tsx"



# ==========================
# Input
# ==========================


@'
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
'@ | Set-Content "src/components/ui/Input.tsx"



# ==========================
# Badge
# ==========================


@'
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
'@ | Set-Content "src/components/ui/Badge.tsx"



# ==========================
# Loading
# ==========================


@'
export default function Loading(){


return(

<div className="flex justify-center p-5">

<div className="
animate-spin
h-8
w-8
rounded-full
border-4
border-green-600
border-t-transparent
"/>

</div>

)

}
'@ | Set-Content "src/components/ui/Loading.tsx"



# ==========================
# EmptyState
# ==========================


@'
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
'@ | Set-Content "src/components/ui/EmptyState.tsx"



# ==========================
# PageHeader
# ==========================


@'
interface Props{

title:string;

description?:string;

}


export default function PageHeader({

title,

description

}:Props){


return(

<div className="mb-6">

<h1 className="text-2xl font-bold">

{title}

</h1>


<p className="text-gray-500">

{description}

</p>


</div>

)

}
'@ | Set-Content "src/components/ui/PageHeader.tsx"



# ==========================
# Sidebar
# ==========================


@'
const menu=[

"Dashboard",

"Associados",

"Modalidades",

"Turmas",

"Instrutores",

"Agenda",

"Relatórios",

"Configurações"

];


export default function Sidebar(){


return(

<aside className="
w-64
bg-green-900
text-white
min-h-screen
p-5
">


<h2 className="
text-2xl
font-bold
mb-8
">

APUSM

</h2>


<nav className="space-y-3">


{menu.map(item=>(

<div

key={item}

className="
hover:bg-green-800
p-3
rounded-lg
cursor-pointer
"

>

{item}

</div>

))}


</nav>


</aside>

)

}
'@ | Set-Content "src/components/layout/Sidebar.tsx"



# ==========================
# Header
# ==========================


@'
export default function Header(){


return(

<header className="
h-16
bg-white
border-b
flex
items-center
justify-between
px-6
">


<h2 className="font-semibold">

Painel Administrativo

</h2>


<div>

Administrador

</div>


</header>

)

}
'@ | Set-Content "src/components/layout/Header.tsx"



# ==========================
# MainLayout
# ==========================


@'
import Sidebar from "./Sidebar";

import Header from "./Header";


export default function MainLayout({

children

}:{

children:React.ReactNode

}){


return(

<div className="flex">


<Sidebar/>


<div className="flex-1">


<Header/>


<main className="p-6">

{children}

</main>


</div>


</div>

)

}
'@ | Set-Content "src/components/layout/MainLayout.tsx"



Write-Host "====================================="
Write-Host " PARTE 2/3 FINALIZADA"
Write-Host "====================================="


Write-Host "====================================="
Write-Host " PARTE 3/3 - INTEGRACAO FINAL"
Write-Host "====================================="


# ==========================
# UI INDEX
# ==========================

@'
export {default as Button} from "./Button";

export {default as Card} from "./Card";

export {default as Input} from "./Input";

export {default as Badge} from "./Badge";

export {default as Loading} from "./Loading";

export {default as EmptyState} from "./EmptyState";

export {default as PageHeader} from "./PageHeader";
'@ | Set-Content "src/components/ui/index.ts"



# ==========================
# Layout INDEX
# ==========================

@'
export {default as Sidebar} from "./Sidebar";

export {default as Header} from "./Header";

export {default as MainLayout} from "./MainLayout";
'@ | Set-Content "src/components/layout/index.ts"



# ==========================
# Routes
# ==========================

@'
import {
BrowserRouter,
Routes,
Route
} from "react-router-dom";


import MainLayout from "../components/layout/MainLayout";


function Dashboard(){


return(

<div>

<h1 className="text-3xl font-bold">

Dashboard APUSM

</h1>


<p className="mt-3 text-gray-500">

Sistema de gestão de modalidades

</p>


</div>

)

}



export default function AppRoutes(){


return(

<BrowserRouter>


<Routes>


<Route

path="/"

element={

<MainLayout>

<Dashboard/>

</MainLayout>

}

/>


</Routes>


</BrowserRouter>

)

}
'@ | Set-Content "src/routes/index.tsx"



# ==========================
# App.tsx
# ==========================

@'
import AppRoutes from "./routes";


export default function App(){

return(

<AppRoutes/>

)

}
'@ | Set-Content "src/App.tsx"



# ==========================
# main.tsx
# ==========================


@'
import React from "react";

import ReactDOM from "react-dom/client";

import App from "./App";

import "./styles/globals.css";


ReactDOM
.createRoot(
document.getElementById("root")!
)

.render(

<React.StrictMode>

<App/>

</React.StrictMode>

);
'@ | Set-Content "src/main.tsx"



# ==========================
# Final mensagem
# ==========================

Write-Host ""
Write-Host "====================================="
Write-Host " APUSM FOUNDATION FINALIZADA"
Write-Host "====================================="
Write-Host ""
Write-Host "Agora execute:"
Write-Host "npm run dev"
Write-Host ""
Write-Host "Acesse:"
Write-Host "http://localhost:5173"