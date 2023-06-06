<script lang="ts">
    export let suit: "♣" |"♠" | "♦" | "♥";
    export let rank: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |13 | 14;

    const directory = {
        "♣": "club",
        "♠": "spade",
        "♦": "diamond",
        "♥": "heart"
    }
</script>

<img src={`/cards/${directory[suit]}/${rank}.svg`} alt="{suit} {rank}">