<script lang="ts">
	import { enhance } from "$app/forms";
</script>

<div class="flex items-center justify-center w-screen h-screen">
    <div class="flex items-center justify-center w-1/2 text-center border-2 shadow-lg bg-onedark-darkblue rounded-xl h-1/2 border-onedark-darkblue">
        <form method="post" action="?/register" use:enhance class="w-2/3 space-y-8">
            <input name="username" type="text" placeholder="username" class="w-full border-b-2 outline-none bg-inherit border-onedark-lightgray">
            <input name="password" type="password" placeholder="password" class="w-full border-b-2 outline-none bg-inherit border-onedark-lightgray">
            <div  class="w-full">
                <button type="submit" class="px-2 border-2 rounded-md md:text-xl text-md border-onedark-lightgray">Register</button>
            </div>
            <div>
                <a href="/auth/login">already have an account?</a>
            </div> 
        </form>       

    </div>
</div>