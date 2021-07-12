import messaging from '@react-native-firebase/messaging';
// import firebase from '@react-native-firebase/app';
import AsyncStorage from '@react-native-community/async-storage';
import {Alert, Platform} from 'react-native';
import {Notifications} from 'react-native-notifications';
import NavigationService from './NavigationService';
let localNotification;
let notifications;

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log("Authorization status:", authStatus);
  }else{
    console.log("Authorization status:", "Not Authorized");
  }
}

export function subscribeToTopic() {
  messaging()
    .subscribeToTopic('signals')
    .then(() => console.log('Subscribed to topic!'));
}

export function unubscribeToTopic() {
  messaging()
    .unsubscribeFromTopic('signals')
    .then(() => console.log('Unsubscribed to topic!'));
}

export async function getFcmToken() {
  messaging().onMessage(async (remoteMessage) => {
    console.log("Hello", remoteMessage)
    // console.log('Messsage Received');
    //alert('A new message arrived!', JSON.stringify(remoteMessage));
    // let date = new Date(Date.now() + (this.state.seconds * 1000));
    //
    // //Fix for IOS
    // if(Platform.OS === "ios"){
    //   date = date.toISOString();
    // }
    //
    // if (remoteMessage.data.message!==undefined){
    //   PushNotification.localNotificationSchedule({
    //     message: remoteMessage.data.message, // (required)
    //     date: date,// (optional) for setting delay
    //     largeIcon:""// set this blank for removing large icon
    //     //smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
    //   });
    // }
    // console.log(
    //   'Notification44 caused app to open from quit state:',
    //   remoteMessage,
    // );
    // console.log('navigation', navigation);
    // console.log('route', route);

    //console.log("Message",remoteMessage)
  });
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
     console.log('Message handled in the background!', remoteMessage);
    // const {index, routes} = navigation.dangerouslyGetState();
    // console.log('index', index);
    // console.log('routes', routes);
    // PushNotification.localNotificationSchedule({
    //       message: remoteMessage.data.message, // (required)
    //       date: date,// (optional) for setting delay
          // largeIcon:""// set this blank for removing large icon
          //smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
      //   });
  
    // const currentRoute = routes[index].name;
    // // console.log('Hello', currentRoute);
    // if (currentRoute === 'BottomTabs') {
    //   fetchData();
    //   navigation.navigate('Home');
    // }
  });
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        // console.log(
        //   'Notification22 caused app to open from quit state:',
        //   remoteMessage,
        // );
      }
    });
}

export function cancelAllNotification() {
  if (Platform.OS === 'ios') {
    Notifications.ios.cancelAllLocalNotifications();
  }
}



function setNotificationListeners() {
  const chanelId = 'swing_schannel';
  notifications = messaging().onMessage(async (notification) => {
    console.log('notification', notification);
    localNotification = Notifications.postLocalNotification({
      title: notification.notification.title,
      // body: 'Local notification!',
      // sound: 'chime.aiff',
      // silent: false,
      // category: 'SOME_CATEGORY',
      // userInfo: {},
    });
  });

  messaging().onNotificationOpenedApp((remoteMessage) => {
    //NavigationService.navigate('Today Signal');
    console.log('remoteMessage background', remoteMessage);
  });


  

const setListeners =()=>{

  
  // application is closed
}


}
