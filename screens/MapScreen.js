import React, { Component } from 'react';
import { View, ActivityIndicator, Picker, Text } from 'react-native';
import { MapView } from 'expo';
import { connect } from 'react-redux';
import { Button, Icon } from 'react-native-elements';
import { Spinner } from '../components/common/spinner'
import { getNearbyUsers, addNewEmergency, getEmergencyCategories, activeEmergencyExpires } from '../actions';
import moment from 'moment';

class MapScreen extends Component {
  static navigationOptions = {
    title: 'Map',
    tabBar: {
      icon: ({ tintColor }) => {
        return <Icon name="my-location" size={30} color={tintColor} />;
      }
    }
  }

  state = {
    mapLoaded: false,
    region: {
      longitude: -122,
      latitude: 37,
      longitudeDelta: 0.04,
      latitudeDelta: 0.09
    },
    addingEmergency: false
  }

  componentDidMount() {
    this.props.getNearbyUsers()
    this.props.getEmergencyCategories()
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            longitudeDelta: 0.04,
            latitudeDelta: 0.09
          },
          mapLoaded: true
        })
      },
      (error) => {
        this.setState({ error })
      })
  }

  onRegionChangeComplete = (region) => {
    this.setState({ region });
  }

  onRequestHelpButtonPress = () => {
    const lat = this.state.region.latitude
    const lng = this.state.region.longitude
    const categoryId = this.state.selectedCategory

    this.props.addNewEmergency({ lat, lng, categoryId })
  }

  renderRequestOrTimeout = () => {
    if (this.props.map.loading) {
      return (
        <View style={styles.buttonContainer}>
          <Spinner size="large" />
        </View>
      )
    } else if (this.props.map.activeEmergency) {
      console.log('>> ACTIVE FOUND')
      const calculateDuration = () => {
        const now = moment(new Date())
        const expiresAt = moment(new Date(this.props.map.activeEmergency.expiresAt))
        const duration = Math.floor(moment.duration(expiresAt.diff(now)).asSeconds())
        if (duration <= 0) {
          stopInterval()
          this.props.activeEmergencyExpires()
          console.log('>> ACTIVE CLEARED')
          console.log('>> INTERVAL STOPPED')
        } else {
          this.setState({ timeLeft: duration })
        }
      }
      const interval = setInterval(calculateDuration, 1000)
      const stopInterval = () => {
        clearInterval(interval)
      }
      return (
        <View style={styles.buttonContainer}>
          <Text>Contacting nearby drivers, {this.state.timeLeft} Seconds remaining until timeout</Text>
        </View>
      )
    } else if (!this.props.map.loading && !this.props.map.activeEmergency) {
      return (
        <View style={styles.buttonContainer}>
          <Picker
            selectedValue={this.state.selectedCategory}
            style={{ height: 50, flex: 1 }}
            onValueChange={(itemValue, itemIndex) => this.setState({ selectedCategory: itemValue })}>
            {this.props.map.categories.map(category => {
              return (
                <Picker.Item key={category.id} label={category.name} value={category.id} />
              )
            })}
          </Picker>
          <Button
            large
            title="Request Help"
            icon={{ name: 'search' }}
            onPress={this.onRequestHelpButtonPress.bind()}
          />
        </View>
      )
    }
  }

  render() {
    if (!this.state.mapLoaded) {
      return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <MapView
          region={this.state.region}
          showsTraffic={true}
          style={{ flex: 1 }}
          showsMyLocationButton={true}
          showsUserLocation={true}
          onRegionChangeComplete={this.onRegionChangeComplete}
        >
          {this.props.map.nearbyUsers.map((user, index) => {
            return (
              <MapView.Marker
                key={index}
                coordinate={{
                  latitude: user.location.lat,
                  longitude: user.location.lng,
                }}
              />
            );
          })}
        </MapView>
        {this.renderRequestOrTimeout()}
      </View>
    );
  }
}

const styles = {
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: "#009688"
  }
}

function mapStateToProps({ auth, map }) {
  return {
    map: {
      nearbyUsers: map.nearbyUsers,
      categories: map.categories,
      activeEmergency: map.activeEmergency,
      loading: map.loading
    }
  }
}

export default connect(mapStateToProps, { getNearbyUsers, addNewEmergency, getEmergencyCategories, activeEmergencyExpires })(MapScreen);
