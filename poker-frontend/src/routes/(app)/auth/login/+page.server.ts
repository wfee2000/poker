import { digestMessage } from "$lib/hash";
import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions : Actions  = {
    login: async ({request, fetch, cookies}) => {

        const formData = await request.formData();

        const username = formData.get("username") as string;
        const password = digestMessage(formData.get("password") as string);

        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name: username, password: password}),
        });

        console.log(response.status)

        if(!response.ok) return;

        cookies.set("id", await response.text(), {
            maxAge: 60*60*24,
            secure: false,
            path:"/",
        });

        throw redirect(301, "/rooms");
    }
}