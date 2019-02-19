// @flow

import React, {
  Fragment,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import type { Location } from 'react-router';

import Container from 'semantic-ui-react/dist/commonjs/elements/Container';
import Image from 'semantic-ui-react/dist/commonjs/elements/Image';
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon';
import Menu from 'semantic-ui-react/dist/commonjs/collections/Menu';
import Modal from 'semantic-ui-react/dist/commonjs/modules/Modal';
import Sidebar from 'semantic-ui-react/dist/commonjs/modules/Sidebar';

import { clearAlert, appInit } from 'actions/app';

import { getAlert } from 'selectors/app';

import Account from 'sections/Account/components/MenuItem';

import { useResponsive } from '../Responsive';
import Notifier from '../Notifier';
import CompletePurchase from '../BuySubscription/Complete';

import thyme from './Thyme.svg';

import './App.css';
import './print.css';

type AppProps = {
  location: Location;
  children: any;
  alertMessage: string;
  onInitialize: () => void;
  onCloseAlert: () => void;
}

function useMenuOpened(initialValue: boolean) {
  const [menuOpened, setMenuOpened] = useState<boolean>(initialValue);

  function handleToggle() {
    setMenuOpened(!menuOpened);
  }

  function handleClose() {
    setMenuOpened(false);
  }

  return [menuOpened, handleToggle, handleClose];
}

function App({
  children,
  location,
  alertMessage,
  onCloseAlert,
  onInitialize,
}: AppProps) {
  const [menuOpened, handleToggle, handleClose] = useMenuOpened(false);
  const appLink = useCallback((name, path, icon: string, exact = false) => {
    const currentPath = location.pathname;

    return (
      <Link
        className={classnames('item', {
          active: exact
            ? currentPath === path
            : currentPath.indexOf(path) === 0,
        })}
        to={path}
        onClick={handleClose}
      >
        <Icon name={icon} />
        {name}
      </Link>
    );
  }, [location, handleClose]);

  // callback on mount
  useEffect(() => onInitialize(), []);

  const [isDesktop] = useResponsive({ min: 'desktop' });

  const MenuItems = (
    <Fragment>
      {appLink('Timesheet', '/', 'stopwatch', true)}
      {appLink('Reports', '/reports', 'chart pie')}
      {appLink('Projects', '/projects', 'sitemap')}
      {appLink('Settings', '/settings', 'cog')}
      <a href="https://usethyme.com/documentation" className="item">
        <Icon name="help circle" />
        Support
      </a>
      <Menu.Menu position="right">
        <Menu.Item>
          <Account />
        </Menu.Item>
      </Menu.Menu>
    </Fragment>
  );

  return (
    <div className="App">
      <Sidebar.Pushable>
        <Sidebar
          as={Menu}
          animation="overlay"
          icon="labeled"
          inverted
          vertical
          visible={menuOpened}
          onHide={handleClose}
        >
          {isDesktop ? null : MenuItems}
        </Sidebar>

        <Sidebar.Pusher dimmed={menuOpened}>
          <Menu fixed="top" inverted>
            <Container>
              {isDesktop ? (
                <Fragment>
                  <Link className="header item" to="/">
                    <Image
                      size="mini"
                      src={thyme}
                      alt="Thyme"
                      style={{ width: 24, marginRight: '1.5em' }}
                    />
                    Thyme
                  </Link>
                  {MenuItems}
                </Fragment>
              ) : (
                <Fragment>
                  <Menu.Item position="left" onClick={handleToggle}>
                    <Icon name="sidebar" />
                  </Menu.Item>
                  <Menu.Item className="App-Title">
                    <Image
                      size="mini"
                      src={thyme}
                      alt="Thyme"
                      style={{ width: 24, marginRight: '1.5em' }}
                    />
                    Thyme
                  </Menu.Item>
                </Fragment>
              )}
            </Container>
          </Menu>
          <Container fluid className="App__Container">
            <Modal
              open={alertMessage !== ''}
              onClose={onCloseAlert}
              content={alertMessage}
              size="mini"
              actions={[
                { key: 'OK', content: 'OK', positive: true },
              ]}
            />

            <CompletePurchase />
            <Notifier />

            {children}
          </Container>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    alertMessage: getAlert(state),
  };
}

function mapDispatchToProps(dispatch: ThymeDispatch) {
  return {
    onInitialize() {
      dispatch(appInit());
    },
    onCloseAlert() {
      dispatch(clearAlert());
    },
  };
}

export default withRouter<*>(compose(
  connect(mapStateToProps, mapDispatchToProps),
)(App));
