export enum CallbackType {
    CLIENT_CONFIRM, // Send event and data to specific client and wait for confirmation of delivery
    SPECIFIC_CLIENT_WITH_RESULT, // Send event and data to specific client and wait for a valid result
    BROADCAST_CONFIRM, // Send event and data to all clients and wait for confirmation of delivery
}