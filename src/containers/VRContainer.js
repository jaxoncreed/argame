import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Home.css';
import io from 'socket.io-client';
import { AFrameRenderer, Marker } from 'react-web-ar';

let socket;

class VRContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    let self = this;
    const setUpListeners = () => {
      AFRAME.registerComponent('hiro-image', { // eslint-disable-line no-undef
        init: function() {
          this.el.addEventListener('mouseenter', (evt) => {
            socket.emit('lookingAt', {
              user: self.state.user,
              item: 'hiro'
            });
          });
          this.el.addEventListener('mouseleave', (evt) => {
            socket.emit('lookingAway', {
              user: self.state.user,
              item: 'hiro'
            });
          });
        }
      });
      AFRAME.registerComponent('kanji-image', { // eslint-disable-line no-undef
        init: function() {
          this.el.addEventListener('mouseenter', (evt) => {
            socket.emit('lookingAt', {
              user: self.state.user,
              item: 'kanji'
            });
          });
          this.el.addEventListener('mouseleave', (evt) => {
            socket.emit('lookingAway', {
              user: self.state.user,
              item: 'kanji'
            });
          });
        }
      });
    };
    setUpListeners();

    window.addEventListener('message', (event) => {
      if (event.data.key) {
        socket = io('https://www.o.team', { query: event.data.key });
      } else if (event.data.state) {
        this.setState(event.data.state);
      }

    });
  }

  render() {
    console.log('VR State');
    console.log(this.state);
    return (
      <div onClick={ () => {
        socket.emit('pickUp', {
          user: this.state.user
        });
      }}>
        <AFrameRenderer
          arToolKit={{
            displayWidth: window.innerWidth,
            displayHeight: window.innerHeight / 2,
            areaLearningButton: false,
            canvasWidth: window.innerWidth,
            canvasHeight: window.innerHeight / 2,
            markersAreaEnabled: false,
            debugUIEnabled: false,
            detectionMode: 'mono_and_matrix',
            matrixCodeType: '3x3',
            sourceType: 'webcam'
          }} embedded vr-mode-ui={false} getSceneRef={(ref) => this.scene = ref} vr-mode>
          <a-cursor fuse="false"></a-cursor>
          <a-assets><img id="g" src="/images/g.png" /></a-assets>
          <a-assets><img id="gw" src="/images/gw.png" /></a-assets>
          <a-assets><img id="ge" src="/images/ge.png" /></a-assets>
          <a-assets><img id="gf" src="/images/gf.png" /></a-assets>
          <a-assets><img id="ga" src="/images/ga.png" /></a-assets>
          <a-assets><img id="gwe" src="/images/gwe.png" /></a-assets>
          <a-assets><img id="gwf" src="/images/gwf.png" /></a-assets>
          <a-assets><img id="gwa" src="/images/gwa.png" /></a-assets>
          <a-assets><img id="gef" src="/images/gef.png" /></a-assets>
          <a-assets><img id="gea" src="/images/gea.png" /></a-assets>
          <a-assets><img id="gfa" src="/images/gfa.png" /></a-assets>
          <a-assets><img id="gwef" src="/images/gwef.png" /></a-assets>
          <a-assets><img id="gwea" src="/images/gwea.png" /></a-assets>
          <a-assets><img id="gwfa" src="/images/gwfa.png" /></a-assets>
          <a-assets><img id="gefa" src="/images/gefa.png" /></a-assets>
          <a-assets><img id="gwefa" src="/images/gwefa.png" /></a-assets>
          <a-assets><img id="aw" src="/images/aw.png" /></a-assets>
          <a-assets><img id="ae" src="/images/ae.png" /></a-assets>
          <a-assets><img id="af" src="/images/af.png" /></a-assets>
          <a-assets><img id="aa" src="/images/aa.png" /></a-assets>
          <a-assets><img id="d" src="/images/d.png" /></a-assets>
          <a-assets><img id="do" src="/images/do.png" /></a-assets>
          <a-assets><img id="empty" src="/images/empty.jpg" /></a-assets>
          <Marker parameters={{ preset: 'hiro' }}>
            <a-image src={ '#' + ((this.state.markerItems && this.state.markerItems.hiro) || 'empty') } width="1" height="1" rotation="90 0 0" hiro-image></a-image>
          </Marker>
          <Marker parameters={{ preset: 'kanji' }}>
            <a-image src={ '#' + ((this.state.markerItems && this.state.markerItems.kanji) || 'empty') } width="1" height="1" rotation="90 0 0" kanji-image></a-image>
          </Marker>

        </AFrameRenderer>
      </div>
    );
  }
}

export default VRContainer;