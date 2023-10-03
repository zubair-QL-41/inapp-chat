export interface room{
    room:string;
    message:string;
    action: 'join' | 'leave' | 'send';
}