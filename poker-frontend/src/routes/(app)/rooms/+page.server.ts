import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";


export const load: PageServerLoad = async ({ cookies, fetch }) => {

    let id = cookies.get("id");
    console.log(id)
    //if(!id) throw redirect(301, "/auth/login");

    const response = await fetch("http://localhost:5000/rooms");

    let data = await response.json();
    
    return {
        rooms : data,
        id
    };
}