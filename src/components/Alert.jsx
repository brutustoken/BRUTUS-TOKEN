import React, {Component} from "react";

let inter = null

class Alert extends Component {

    constructor(props) {
        super(props);

        this.state = {
            title: "Alert",
            message: "",
            //...this.props
        }

        this.mostrarMensaje = this.mostrarMensaje.bind(this);
    }

    async componentDidMount() {

        inter = setInterval(()=>{
            this.mostrarMensaje()
        }, 1000)

    }

    async componentWillUnmount(){
        clearInterval(inter)
    }

    async mostrarMensaje(){

        let {message} = this.state

        if(this.props.message){
            if(message !== this.props.message){
                this.setState({
                    ...this.props,
                })
                window.$("#alert").modal("show");
            }
        }
       

    }


    render(){

        let {title, message} = this.state

        return(<>
            <button type="button" className="btn btn-primary" onClick={() => {
                window.$("#alert").modal("show");
            }}>See last Message</button>
    
            <div className="modal fade" id="alert">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{title}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal">
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>{message}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>)
    }
}



export default Alert;