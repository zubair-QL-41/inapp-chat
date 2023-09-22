// export const enum action{
//     JOIN = 'join',
//     LEAVE = 'leave',
//     SEND = 'send'
// }

export interface room{
    room:string;
    message:string;
    action: string;
}