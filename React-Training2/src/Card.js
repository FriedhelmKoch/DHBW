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
