import React, { Component } from 'react';
import "./Panel.css";

class Panel extends Component {
    
    render() {
        console.log(this);
        return (
            <div className="Panel">
                <h4 className="Panel-title">
                    {this.props.title}
                </h4>
                    
                <div className="Panel-content">
                    {this.props.children}
                </div>

            </div>
        )
    }

}

Panel.propTypes = {
    /** Validieren des Titels vom Panel 
     * setzt das npm Modul Prop-Types voraus:
     *      npm install --save prop-types 
    */
    title: React.PropTypes.string.isRequired
}
export default Panel;