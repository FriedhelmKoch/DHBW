import React from 'react';
import { Page, Navbar, List, ListItem } from 'framework7-react';

export default class extends React.Component {

  constructor(props) {
    super(props);
    this.state = {isLoggedIn: true,}
  };

  render() {
    return (

      <Page name="test">
        <Navbar title="Conditional Rendering" />
        <div>
          {this.state.isLoggedIn ? (
            <h1>Du bist angemeldet</h1>   //true
          ) : (
            <h1>Du bist nicht angemeldet!</h1>
          )}
        </div>
      </Page>

    );
  }
}
