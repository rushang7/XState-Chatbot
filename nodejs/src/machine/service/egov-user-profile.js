class UserProfileService {
  async updateUser(user, tenantId) {
    let requestBody = {
      RequestInfo: {
        authToken: user.authToken
      },
      user: user.userInfo
    };
    let url = config.userServiceHost + config.userServiceUpdateProfilePath + '?tenantId=' + tenantId;

    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: requestBody
    }

    let response = await fetch(url, options);
    if(response.status === 200) {
      let responseBody = await response.json();
      return responseBody;
    } else {
      console.error('Error Updating the user profile');
      return undefined;
    }
  }
}

module.exports = new UserProfileService();