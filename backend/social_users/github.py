import requests 
from django.conf import settings
from rest_framework.exceptions import AuthenticationFailed


class Github:
    @staticmethod
    def exchange_code_for_token(code):
        param_payload={
            "client_id":settings.GITHUB_CLIENT_ID,
            "client_secret":settings.GITHUB.CLIENT_SECRET,
            "code":code
        }
        res = requests.post("https://github.com/login/oauth/access_token", params=param_payload, headers={'Accept': 'application/json'})
        payload=res.json()
        token=payload.get("access_token")
        return token


    @staticmethod
    def retrieve_github_user(access_token):
        try:
            headers={
                "Authorization": f"Bearer {access_token}"
            }
            response= requests.get("https://api.github.com/user", headers=headers)
            user_data=response.json()
            return user_data
        
        except Exception as e:
            raise AuthenticationFailed(detail="token is invalid or has expired")