/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

interface IProps {
  loadMore: boolean,
  callBack: () => void,
  loadOnMount?: boolean,
  container?: any,
  children: React.ReactNode
}

interface IState {
  container: any
}

export class InfinitScroller extends React.PureComponent<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = {
      container: this.props.container
    }
  }

  override componentDidUpdate() {
    if (this.props.container) {
      this.setState({ container: this.props.container }, () => {
        this.state.container.addEventListener('scroll', this.onScroll);
      });
    } else {
      window.addEventListener('scroll', this.onScroll);
    }
  }

  override componentDidMount() {

    const { loadOnMount, callBack } = this.props;
    const { container } = this.state
    if ((loadOnMount && container) || (!loadOnMount && container)) {
      callBack();
      container.addEventListener('scroll', () => this.onScroll());
    } else if (loadOnMount && !container) {
      callBack();
      // console.log('loadOnMount and container not');
      window.addEventListener('scroll', this.onScroll);
    } else if (!container) {
      // console.log('no container');
      window.addEventListener('scroll', this.onScroll);
    }
  }

  private onScroll = () => {
    const { callBack, container, loadMore } = this.props;
    if (container) {
      if (
        (container.scrollTop + container.clientHeight >= container.scrollHeight) && loadMore) {
        callBack();
        container.removeEventListener('scroll', this.onScroll);
      }
    } else {
      if ((window.scrollY + window.innerHeight) >= document.body.scrollHeight) {
        callBack();
        window.removeEventListener('scroll', this.onScroll);
      } // end if
    } // end else
  } // end onScroll

  override render() {
    return (
      <div className={'data-container'}> {this.props.children} </div>
    )
  }
} // end class

export default InfinitScroller;
