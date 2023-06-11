import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, cookies, params }) => {
    const { slug } = params;
    const id = cookies.get('id');
    console.log(id)
    //if(!id) throw redirect(301, "/auth/login");

    return {
        roomId : slug,
        id
    }   
}