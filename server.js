import express from 'express';

import httpServer from 'http';
import socketIo from 'socket.io';

const app = express();
const http = httpServer.Server(app);
const io = socketIo(http, { origins: '*:*'});


// Store canvas on server to download canvas when a client connects
let userData = [
  {
    message: "You are the Ghost. In your inventory is an amulet. The metal of the amulet seems to ripple under the surface like ocean waves. You are enamored by this amulet.",
    inventory: ['aw']
  },
  {
    message: "You are the Adventurer. In your inventory is an amulet. The amulet feels dark and cool to the touch, a strong, sturdy piece of metal. You feel comfortable holding it.",
    inventory: ['ae']
  },
  {
    message: "You are the Magician. In your inventory is an amulet. This amulet glows with an inner fire and feels slightly warm to the touch. You are naturally drawn to this item.",
    inventory: ['af']
  },
  {
    message: "You are the Noble. In your inventory is an amulet. The amulet feels lighter than it should, as if caressed by the wind. You are fascinated by this amulet.",
    inventory: ['aa']
  }
];
let defaultUserData = {
  message: "You are an observer of the party."
}


let state = {
  numberOfPlayers: 0,
  markerItems: {
    hiro: 'g',
    kanji: 'do'
  },
  playerInventory: [],
};

let lookingAt = {};

let keyMap = {};

const circletPickupMessage = "This circlet has four grooves that could hold a small metal object. It feels incomplete somehow, and you know it will further your goal to make it whole.";
const awMessage = "You hear a faint whisper, incredulous, ‘No. It can’t be. Not you.’ as the amulet touches the circlet. The ghost twitches as the metal fits into one of the four grooves."
const aeMessage = "Everyone must forget who we are.’ Echoes between the trees as the amulet nears the circlet. The adventurer feels a sense of unease as the amulet fits in one of the four grooves on the circlet."
const afMessage = "WHAT HAVE YOU DONE?! an incorporeal voice shouts, startling you. This voice sounds as wise and learned as it does angry. The magician twitched upon hearing it. The amulet fits snugly in one of the four grooves on the circlet."
const aaMessage = "The group hears whispers as if they were behind the nearest trees, of a majestic voice banishing a noble family for presumed treason. The amulet fits securely in one of the four grooves on the circlet."
const completeMessage = " As the last of the amulets is fitted into the circlet, the group suddenly sees a flash of light and a experiences sense of completed-ness. You get the feeling that you’ve done something good."

const transitions = {
  g: {
    pickup: circletPickupMessage,
    aw: {
      message: awMessage,
      transition: "gw"
    },
    ae: {
      message: aeMessage,
      transition: "ge"
    },
    af: {
      message: afMessage,
      transition: "gf"
    },
    aa: {
      message: aaMessage,
      transition: "ga"
    }
  },
  ga: {
    pickup: circletPickupMessage,
    aw: {
      message: awMessage,
      transition: "gwa"
    },
    ae: {
      message: aeMessage,
      transition: "gea"
    },
    af: {
      message: afMessage,
      transition: "gfa"
    }
  },
  ge: {
    pickup: circletPickupMessage,
    aw: {
      message: awMessage,
      transition: "gwe"
    },
    af: {
      message: afMessage,
      transition: "gef"
    },
    aa: {
      message: aaMessage,
      transition: "gea"
    }
  },
  gea: {
    pickup: circletPickupMessage,
    aw: {
      message: awMessage,
      transition: "gwea"
    },
    af: {
      message: afMessage,
      transition: "gefa"
    }
  },
  gef: {
    pickup: circletPickupMessage,
    aw: {
      message: awMessage,
      transition: "gwef"
    },
    aa: {
      message: aaMessage,
      transition: "gefa"
    }
  },
  gefa: {
    pickup: circletPickupMessage,
    aw: {
      message: awMessage + completeMessage,
      transition: "gwefa"
    }
  },
  gf: {
    pickup: circletPickupMessage,
    aw: {
      message: awMessage,
      transition: "gwf"
    },
    ae: {
      message: aeMessage,
      transition: "gef"
    },
    aa: {
      message: aaMessage,
      transition: "gfa"
    }
  },
  gfa: {
    pickup: circletPickupMessage,
    aw: {
      message: awMessage,
      transition: "gwfa"
    },
    ae: {
      message: aeMessage,
      transition: "gefa"
    }
  },
  gw: {
    pickup: circletPickupMessage,
    ae: {
      message: aeMessage,
      transition: "gwe"
    },
    af: {
      message: afMessage,
      transition: "gwf"
    },
    aa: {
      message: aaMessage,
      transition: "gwa"
    }
  },
  gwa: {
    pickup: circletPickupMessage,
    ae: {
      message: aeMessage,
      transition: "gwea"
    },
    af: {
      message: afMessage,
      transition: "gwfa"
    },
  },
  gwe: {
    pickup: circletPickupMessage,
    af: {
      message: afMessage,
      transition: "gwef"
    },
    aa: {
      message: aaMessage,
      transition: "gwea"
    }
  },
  gwea: {
    pickup: circletPickupMessage,
    af: {
      message: afMessage + completeMessage,
      transition: "gwefa"
    }
  },
  gwef: {
    pickup: circletPickupMessage,
    aa: {
      message: aaMessage + completeMessage,
      transition: "gwefa"
    }
  },
  gwf: {
    pickup: circletPickupMessage,
    ae: {
      message: aeMessage,
      transition: "gwef"
    },
    aa: {
      message: aaMessage,
      transition: "gwfa"
    }
  },
  gwfa: {
    pickup: circletPickupMessage,
    ae: {
      message: aeMessage + completeMessage,
      transition: "gwefa"
    }
  },
  do: {
    gwefa: {
      message: "As the circlet passes the non-existent threshold on the closed fairy-gate, there is a bright flash of light and a ‘pop’ as the amulets and circlet disappear. The group is suddenly imbued with knowledge that they did not have before as memories swirl around them in a cloud. You are remembering things that happened in years past. Great wars were fought for centuries, and it was only with the creation of the magical band that these wars were stopped and the peaceful kingdom that has existed came into being. With the theft of this band, the king is powerless to stop evil from spreading throughout the realm. For whatever reason, your group has been chosen to find and return the band and save the kingdom. This is… The Band.",
      transition: "d"
    },
    cannotPickup: true
  },
  d: {
    cannotPickup: true
  }
}


io.sockets.on('connection', function (socket) {
  // Add New Player
  socket.on('init', ({ key }) => {
    if (keyMap[key]) {
      socket.emit('initialize2', {
        ...state,
        user: keyMap[key],
        message: userData[keyMap[key] % 4].message
      });
    } else {
      state.playerInventory.push(userData[state.numberOfPlayers % 4].inventory)
      keyMap[key] = state.numberOfPlayers;
      state.numberOfPlayers++;
      socket.emit('initialize1', {
        ...state,
        user: state.numberOfPlayers - 1,
        message: userData[(state.numberOfPlayers - 1) % 4].message
      });
    }
    console.log(state);

  });

  socket.on('lookingAt', (data) => {
    console.log('data');
    lookingAt[data.user] = data.item;
    console.log(lookingAt);
  });

  socket.on('lookingAway', (data) => {
    if (lookingAt[data.user] === data.item) {
      lookingAt[data.user] = '';
    }
    console.log(lookingAt);
  });

  socket.on('pickUp', (data) => {
    const item = state.markerItems[lookingAt[data.user]];
    if (item && (!transitions[item] || !transitions[item].cannotPickup)) {
      const itemTransition = transitions[state.markerItems[lookingAt[data.user]]];
      state.markerItems[lookingAt[data.user]] = '',
      state.playerInventory[data.user].push(item);
      console.log(itemTransition);
      io.sockets.emit('updateState', {
        ...state,
        message: (itemTransition && itemTransition.pickup) ? itemTransition.pickup : ''
      });
    }
  });

  socket.on('useItem', (data) => {
    console.log("Use Item");
    console.log(data);
    if (lookingAt[data.user]) {
      const itemLookingAt = state.markerItems[lookingAt[data.user]];
      const userInventory = state.playerInventory[data.user];
      if (itemLookingAt) {
        const transition = transitions[itemLookingAt][userInventory[data.item]];
        if (transition) {
          state.markerItems[lookingAt[data.user]] = transition.transition;
          userInventory.splice(data.item, 1);
          io.sockets.emit('updateState', {
            ...state,
            message: transition.message
          });
        }
      } else {
        state.markerItems[lookingAt[data.user]] = userInventory[data.item];
        userInventory.splice(data.item, 1);
        io.sockets.emit('updateState', {
          ...state,
        });
      }
    }

  })


  // socket.on('addClick', function(data) {
  // 	clickX.push(data.x);
  // 	clickY.push(data.y);
  // 	clickDrag.push(data.dragging);

  //   socket.broadcast.emit('draw', {
  //     x: data.x,
  //     y: data.y,
  //     dragging: data.dragging
  //   });
  // });
});

http.listen(3001, function () {
  console.log('listening on 3001');
});