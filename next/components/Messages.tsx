export default function Messages(props:{myMessage : boolean , message : string}){
    

    return (
        <div className="flex">
            {props.myMessage && <div className="flex-start">props.message</div>}
            <div className="flex-end"></div>
        </div>
    )

}