import React, {Component,useState,useEffect,useRef} from 'react';
import {FlatList, ActivityIndicator,View,Text,AppState} from 'react-native';
import firebase from 'firebase';
import moment from 'moment';
import _ from 'lodash';
import Item from './Item';
import styles from './styles';
import {Navbar, Loader} from '../../common';
import auth from '@react-native-firebase/auth';
import {authActions} from '../../ducks/auth';
import {connect} from 'react-redux';
import * as actions from '../../user/actionTypes'
import * as Action from '../../user/actionIndex'

import { WP } from '../../utils/Responsive';
import Toast from 'react-native-tiny-toast';


const History =(props)=> {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState([])
  const [nodata, setNoData] = useState(false)
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(AppState.current);
  const [type, setType] = useState("")
  useEffect(() => {
    getData()
    AppState.addEventListener("change", _handleAppStateChange);

    return () => {
      AppState.removeEventListener("change", _handleAppStateChange);
    };
  }, [])

  const getData =()=>{
    let params = { type : props.route.params.title}
    props.getHistory(params).then(response =>{
      setLoading(false)
      if (response !==undefined) {
        response.sort(function compare(a, b) {
          var dateA = new Date(a.created_date);
          var dateB = new Date(b.created_date);
          return dateA - dateB;
        });

        let historyArray = response.filter( (ele, ind) => ind === response.findIndex( elem => elem.created_date === ele.created_date))


        setData(historyArray)
      }else{
        setNoData(true)
      }
    })
  }

  useEffect(() => {
    console.log('props',props)
    props.navigation.addListener('focus' ,()=>{
      getData()
    })
  }, []);

  const _handleAppStateChange = (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      console.log("App has come to the foreground!");
    }

    appState.current = nextAppState;
    setAppStateVisible(appState.current);
    console.log("AppState", appState.current);
  };

  const renderItem = ({item, index}) => {
    item.type = props.route.params.title
    return <Item data={item} />;
  };

  const renderList=()=> {
    return (
      <FlatList
        style={styles.container}
        data={data.reverse()}
        renderItem={renderItem}
      />
    );
  }

  const renderLoader =()=> {
    return <Loader loading={loading} color={'#fff'} />;
  }

  const renderNavbar =()=> {
    console.log("props.route.params.title"+props.route.params.title);
    var tt;
    if(props.route.params.title==='Day Trading')
    tt='Intraday Trading';
    else
    tt='Swing Trading';
    return <Navbar hasDrawer={false} title={tt +' History'} />;
  } 

    return (
      <View style={{marginTop : WP(5)}}>
        {renderNavbar()}
        {!nodata ? renderList() : 
          <View style ={{backgroundColor : '#000',width : '100%',height: '100%',alignItems : 'center', justifyContent : 'center'}}>
            <Text style = {{color :'#fff'}}>No data available</Text>
          </View>
        }
        {renderLoader()}
      </View>
    );
}



const mapDispatchToProps = (dispatch) => {
  // login: authActions.login,
  return {
    getHistory: (params) => dispatch(Action.getHistory(params)),
  };
};

const mapStateToProps = (store) => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(History);