import React, { Component } from 'react';
import "./Card.css";

class Card extends Component {
	render() {
		return (
			<div className="Card">
				<h4 className="Card-title">
					{this.props.title}
				</h4>
				<div className="Card-content">
					{this.props.children}
				</div>
			</div>
		)
	}
}

Card.propTypes = {
  /** Der Titel vom Card */
  title: React.PropTypes.string.isRequired
}

export default Card;