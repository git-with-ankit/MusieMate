import "next-auth"

declare module "next-auth"{
    interface Session {
        user : {
            id : String;
            name? : String | null;
            email : String;
            image? : String | null;
        }
    }
}