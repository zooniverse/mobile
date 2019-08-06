import React, {Component} from 'react'
import Drawer from 'react-native-drawer'
import SideDrawerContent from './SideDrawerContent'
import {Actions, DefaultRenderer} from 'react-native-router-flux'
import PropTypes from 'prop-types';

class SideDrawer extends Component {
    render() {
        const state = this.props.navigationState
        const children = state.children

        return (
            <Drawer
                ref="drawer"
                open={state.open}
                onOpen={() => Actions.refresh({key: state.key, open: true})}
                onClose={() => Actions.refresh({key: state.key, open: false})}
                type="overlay"
                side="right"
                content={<SideDrawerContent/>}
                tapToClose={true}
                openDrawerOffset={0.3}
                panCloseMask={0.2}
                closedDrawerOffset={-3}
                styles={drawerStyles}
                tweenHandler={(ratio) => ({
                    main: {opacity: (2 - ratio) / 2}
                })}
            >
                <DefaultRenderer navigationState={children[0]} onNavigate={this.props.onNavigate}/>
            </Drawer>
        )
    }
}

const drawerStyles = {
    drawer: {
        backgroundColor: 'white',
        shadowColor: 'black',
        shadowOpacity: 0.8,
        shadowRadius: 3,
        elevation: 3,
    }
}

SideDrawer.propTypes = {
    onNavigate: PropTypes.func,
    navigationState: PropTypes.object,
}

export default SideDrawer
