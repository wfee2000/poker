<script lang="ts">
    type Room = {
        name: string,
        id: string,
        playerCount: number,
    };

    let rooms : Room[] = [
        {
            name: "YourMom's room",
            id: "1",
            playerCount: 7,
        },
        {
            name: "YourDad's room",
            id: "2",
            playerCount: 6,
        },
        {
            name: "Wynny's room",
            id: "3",
            playerCount: 1,
        },
        {
            name: "Luka's room",
            id: "4",
            playerCount: 1,
        },
        {
            name: "Luka's room",
            id: "4",
            playerCount: 1,
        }
        ,
        {
            name: "Luka's room",
            id: "4",
            playerCount: 4,
        }
        ,
        {
            name: "Luka's room",
            id: "4",
            playerCount: 1,
        }
        ,
        {
            name: "Luka's room",
            id: "4",
            playerCount: 1,
        }
        ,
        {
            name: "Luka's room",
            id: "4",
            playerCount: 1,
        }
        ,
        {
            name: "Luka's room",
            id: "4",
            playerCount: 1,
        }
    ];

    rooms = rooms.sort((a, b) => {
        if (a.playerCount > b.playerCount)
            return -1;
        if (a.playerCount < b.playerCount)
            return 1;
        return 0;
    });

    $: filteredRooms = rooms;

    const search = (e : Event) => {
        const search = (e.target as any).value as string;

        filteredRooms = rooms.filter(room => room.name.toLowerCase().includes(search.trim().toLowerCase()));
    }

    const fetchRooms = () => {
        //TODO: fetch rooms from server
    }

    const createRoom = () => {
        //TODO: create room
    }

    const joinRoom = () => {
        //TODO: join room
    }    
</script>

<div class="flex items-center justify-center w-full h-[calc(100vh-6vh)]">
    <div class="w-1/2 overflow-auto h-1/2">
        <div class="grid justify-center w-full grid-cols-12">
            <input on:input={search} placeholder="search" class="col-span-11 text-center border-2 border-b-0 outline-none -2 rounded-tl-md md:text-xl text-md border-onedark-lightgray bg-onedark-gray focus:bg-onedark-darkblue">
            <button class="flex items-center justify-center border-2 border-b-0 border-l-0 border-onedark-lightgray rounded-tr-md" on:click={fetchRooms}>
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-onedark-lightgray fill-onedark-lightgray" height="24" width="24" viewBox="0 -960 960 960"><path d="M167-160v-60h130l-15-12q-64-51-93-111t-29-134q0-106 62.5-190.5T387-784v62q-75 29-121 96.5T220-477q0 63 23.5 109.5T307-287l30 21v-124h60v230H167Zm407-15v-63q76-29 121-96.5T740-483q0-48-23.5-97.5T655-668l-29-26v124h-60v-230h230v60H665l15 14q60 56 90 120t30 123q0 106-62 191T574-175Z"/></svg>
            </button>
        </div>
        <div class="overflow-auto border-2 h-5/6 border-onedark-lightgray">
        {#each filteredRooms as room}
            <div class="grid grid-cols-4 p-2">
                <div class="col-span-2">
                    {room.name}
                </div>
                <div class="{room.playerCount < 4 ? "text-onedark-green" : room.playerCount < 6 ? "text-onedark-yellow" : "text-onedark-red"}">
                    {room.playerCount}/8
                </div>
                <form on:submit|preventDefault={joinRoom} class="flex justify-end">
                    <button type="submit" class="px-2 border-2 rounded-md md:text-xl text-md border-onedark-lightgray">join</button>
                </form>
            </div>
        {/each}
        {#if filteredRooms.length == 0}
            <div class="flex items-center justify-center w-full h-full">
                <p class="text-onedark-red">no room found</p>
            </div>
        {/if}
        </div>
        <form on:submit|preventDefault={createRoom} class="flex justify-center w-full">
            <button type="submit" class="w-full px-2 border-2 border-t-0 rounded-b-md md:text-xl text-md border-onedark-lightgray hover:bg-onedark-darkblue">create</button>
        </form>
    </div>
</div>