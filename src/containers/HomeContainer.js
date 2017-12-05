import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Home.css';
import io from 'socket.io-client';
let socket;

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() {
    const key = [...Array(30)].map(() => Math.random().toString(36)[3]).join('');
    socket = io.connect('https://www.o.team', { query: key })
    socket.on('connect', (data) => {
      socket.emit('init', { key });
    });

    socket.on('connect_failed', function(){
      alert('Connection Failure try again');
    });

    socket.on('initialize1', ({ message, ...newState }) => {
      this.setState(newState);

      setTimeout(() => {
        document.getElementById('frame').contentWindow.postMessage({ state: newState }, '*');
      }, 2000);
      if (message) {
        alert(message);
      }
    });

    socket.on('updateState', ({ message, ...newState }) => {
      console.log('updateState');
      console.log(newState);
      this.setState(newState);
      document.getElementById('frame').contentWindow.postMessage({ state: newState }, '*');
      if (message) {
        alert(message);
      }

    });

    setTimeout(() => {
      document.getElementById('frame').contentWindow.postMessage({ key }, '*');
    }, 1000);
  }

  render() {
    console.log('homeState');
    console.log(this.state);
    return (
      <div className="">
        <iframe id="frame" src="https://o.team/vr">
          <p>Your browser does not support iframes.</p>
        </iframe>
        <div className="interface">
          <div className="vrOverlay" />
          <div className="inventory">
            {(() => {
              if (this.state.playerInventory && this.state.playerInventory[this.state.user]) {
                return this.state.playerInventory[this.state.user].map((inventory, index) => (
                  <img src={'/images/' + inventory + '.png'}
                    key={inventory + index}
                    onClick={() => {
                      socket.emit('useItem', {
                        user: this.state.user,
                        item: index
                      });
                    }} />
                ));
              }
            })()}
          </div>
        </div>
      </div>
    );
  }
}

export default Home;