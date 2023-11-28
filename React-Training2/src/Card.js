import React, { Component } from 'react';
import "./Card.css";

class Card extends Component {

    constructor(props) {
        super(props);

        this.state = {   
            title: this.props.title
        }

    } 

    
    render() {
        console.log(this);
        
        return (
            <div className="Card">
                <h4 className="Card-title">
                    {this.state.title}
                </h4>
                    
                <div className="Card-content">
                    {this.props.children}
                </div>

            </div>
        )
    }

}

export default Card;

// define the types of the properties that are passed to the component
Card.prototype.props = /** @type { { 
    title: string, 
    fontSize: number,
    children: React.ReactNode 
} } */ ({});

