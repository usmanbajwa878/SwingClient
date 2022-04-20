import React, { Component } from 'react';
import messaging from '@react-native-firebase/messaging';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Button,
  Linking,
  Platform,
} from 'react-native';
import { storeData, getData } from '../../utils/LocalDB';
import * as Actions from '../../user/actionIndex';
import auth from '@react-native-firebase/auth';
import { connect } from 'react-redux';
import firebase from 'firebase';
import { BannerView, AdSettings } from 'react-native-fbads';

import styles from './styles';

import { NavigationService, DataHandler } from '../../utils';
import { authActions } from '../../ducks/auth';
import { Loader } from '../../common';
import { subscribeToTopic,getFcmToken,requestUserPermission } from '../../utils/FirebaseUtil';
import Images from '../../theme/Images';
import { ScrollView } from 'react-native-gesture-handler';
import { LoginManager } from 'react-native-fbsdk';
import { login } from '../../ducks/auth/actions';

class Login extends Component {
  state = {
    email: '',
    password: '',
    errorMessage: '',
    loading: false,
  };

  componentWillMount() {
    console.log('AdSettings.currentDeviceHash', AdSettings.currentDeviceHash);
    AdSettings.clearTestDevices();
    AdSettings.addTestDevice(AdSettings.currentDeviceHash);
  }

  checkIsUserSubscribe = (uid) => {

    let params = {
      id: uid
    }

    console.log(params)

    this.props.checkSubscription(params).then(response => {
      if (response != undefined) {
        if (response.is_subscribed) {
          subscribeToTopic();
          this.props.navigation.navigate('DrawerScreen')
          DataHandler.setUserSubscribe(is_subscribe);
          this.setState({ loading: false });
        } else {
          this.props.navigation.navigate('DrawerScreen', { id: uid })
          this.setState({ loading: false });
        }
      } else {
        this.props.navigation.navigate('DrawerScreen', { id: uid })
        this.setState({ loading: false });
      }
    })

    // firebase
    //   .database()
    //   .ref(`users/${uid}`)
    //   .once('value', (snapshot) => {
    //     console.log('snapshot.val()', snapshot.val());
    //     const {is_subscribe} = snapshot.val();
    //     if (snapshot.val().is_subscribe) {
    //       subscribeToTopic();
    //       NavigationService.reset('DrawerScreen');
    //       DataHandler.setUserSubscribe(is_subscribe);
    //       this.props.login({uid});
    //       this.setState({loading: false});
    //     } else {
    //       NavigationService.reset('Subscription');
    //       this.props.login({uid});
    //     }
    //   });
  };

  onSignIn = () => {
    requestUserPermission()
    const { email, password } = this.state;
    if (email !== '' && password !== '') {
      const trimedEmail = email.trim().toLowerCase();
      const trimedPassword = password.trim();
      let params = {
        username: email,
        password: password,
      };
      this.setState({ loading: true }, () => {
        this.props
          .login(params)
          .then(async (user) => {

            if (user !== undefined) {
              let fcmToken = await messaging().getToken();;
              console.log("getFcm", user);
              getFcmToken()

              let fcmParams = {
                user_id: user.user.pk,
                fcm_token: fcmToken,
              };
              this.props
                .setFcmToken(fcmParams)
                .then((response) => {
                  this.setState({ loading: false });
                  if (response !== undefined) {
                    this.handleSignInResult(user);
                  }
                })
            }
            this.props.navigation.navigate('Subscription', { id: user.user.pk })
           // this.checkIsUserSubscribe(user.user.pk); //open it
      // console.log('isSubscribed', isSubscribed);
      // if (isSubscribed) {
      //   // this.props.login({uid});
      //   subscribeToTopic();
      //   NavigationService.reset('DrawerScreen');
      // } else {
      //   NavigationService.reset('Subscription');
      // }
    })
          .catch ((error) => {
      console.log('error', error);
      if (error.code === 'auth/user-not-found') {
        this.setState({
          loading: false,
          errorMessage: 'No user found with this email!',
        });
      }
      if (error.code === 'auth/email-already-in-use') {
        this.setState({
          loading: false,
          errorMessage: 'That email address is already in use!',
        });
      }
      if (error.code === 'auth/invalid-email') {
        this.setState({
          loading: false,
          errorMessage: 'That email address is invalid!',
        });
      }
      if (error.code === 'auth/wrong-password') {
        this.setState({
          loading: false,
          errorMessage: 'That password is invalid!',
        });
      }
    });
  });
} else {
  this.setState({
    errorMessage: 'Please Enter Email & Password',
  });
}
  };

handleSignInResult = async (user) => {
  await storeData('user_data', JSON.stringify(user));
};

onFocus = () => {
  this.setState({ errorMessage: '' });
};

onCreateAccPress = () => {
  NavigationService.navigate('Signup');
};

onChangeEmail = (email) => {
  this.setState({ email });
};

onChangePassword = (password) => {
  this.setState({ password });
};

renderEmail() {
  const { email } = this.props;
  return (
    <TextInput
      keyboardType="email-address"
      textContentType="emailAddress"
      autoCorrect={false}
      autoCapitalize="none"
      placeholderTextColor="#ccc"
      placeholder={'Username'}
      style={styles.inputField}
      autoCapitalize="none"
      onChangeText={this.onChangeEmail}
      value={email}
      onFocus={this.onFocus}
    />
  );
}

renderPassword() {
  const { password } = this.props;
  return (
    <TextInput
      keyboardType="default"
      placeholderTextColor="#ccc"
      placeholder={'Password'}
      style={styles.inputField}
      onChangeText={this.onChangePassword}
      value={password}
      secureTextEntry
      autoCapitalize="none"
      onFocus={this.onFocus}
    />
  );
}

renderErrorMessage() {
  const { errorMessage } = this.state;
  if (errorMessage === '') {
    return null;
  }
  return (
    <Text onPress={this.onAlreadyHavAcc} style={styles.errorMessage}>
      {errorMessage}
    </Text>
  );
}

renderSignUpButton() {
  return (
    <TouchableOpacity onPress={this.onSignIn} style={styles.btnContainer}>
      <Text style={styles.btnText}>SIGN IN</Text>
    </TouchableOpacity>
  );
}

renderCreateAccount() {
  return (
    <Text onPress={this.onCreateAccPress} style={styles.createAcc}>
      Create account here?
    </Text>
  );
}


renderLogo() {
  return (
    <View style={styles.logoContainer}>
      <Image style={styles.logoImg} source={Images.icons.logo} />
    </View>
  );
}

renderLoader() {
  const { loading } = this.state;
  return <Loader loading={loading} color={'#fff'} />;
}

renderTermsAndPriivacy() {
  return (
    <View style={styles.termsAndUse}>
      <Button
        title="Privacy policy"
        onPress={() => {
          Linking.openURL('https://forexprofitbot.com/privacy-policy/');
        }}
      />
      <Text style={{ color: '#fff' }}>and</Text>
      <Button
        title="Terms of use"
        onPress={() => {
          Linking.openURL(
            'https://forexprofitbot.com/terms-of-service-agreement',
          );
        }}
      />
    </View>
  );
}

render() {
  return (
    <ScrollView
      style={{ backgroundColor: '#000' }}
      contentContainerStyle={styles.container}>
      {this.renderLogo()}
      {this.renderEmail()}
      {this.renderPassword()}
      {this.renderErrorMessage()}
      {this.renderSignUpButton()}
      {this.renderCreateAccount()}
      {this.renderLoader()}
      {Platform.OS === 'ios' && this.renderTermsAndPriivacy()}
    </ScrollView>
  );
}
}
const actions = (dispatch) => {
  // login: authActions.login,
  return {
    login: (params) => dispatch(Actions.login(params)),
    checkSubscription: (params) => dispatch(Actions.checkSubscription(params)),
    setFcmToken: (params) => dispatch(Actions.setFcmToken(params)),
  };
};


const mapStateToProps = (store) => ({
  isSubscribed: store.auth.subscriptionActive,
});

export default connect(mapStateToProps, actions)(Login);
