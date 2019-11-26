# OIDC

上来三连问 what, why, how

## ODIC 是什么

看一下官方的介绍
```
OpenID Connect 1.0 is a simple identity layer on top of the OAuth 2.0 protocol. It allows Clients to verify the identity of the End-User based on the authentication performed by an Authorization Server, as well as to obtain basic profile information about the End-User in an interoperable and REST-like manner.

OpenID Connect allows clients of all types, including Web-based, mobile, and JavaScript clients, to request and receive information about authenticated sessions and end-users. The specification suite is extensible, allowing participants to use optional features such as encryption of identity data, discovery of OpenID Providers, and session management, when it makes sense for them.
```
简单翻译下就是: 

OIDC是OpenID Connect的简称，OIDC=(Identity, Authentication) + OAuth 2.0。它在OAuth2上构建了一个身份层，是一个基于OAuth2协议的身份认证标准协议。我们都知道OAuth2是一个授权协议，它无法提供完善的身份认证功能(why)

## Specification Organization

- [Core](http://openid.net/specs/openid-connect-core-1_0.html)：必选。定义OIDC的核心功能，在OAuth 2.0之上构建身份认证，以及如何使用Claims来传递用户的信息。
- [Discovery](http://openid.net/specs/openid-connect-discovery-1_0.html)：可选。发现服务，定义客户端如何动态的获取OIDC服务相关信息（比如支持那些规范，接口地址是什么等等）。
- [Dynamic Registration](http://openid.net/specs/openid-connect-registration-1_0.html)：可选。动态注册服务，使客户端可以动态的注册到OIDC的服务提供者。
- [OAuth 2.0 Multiple Response Types](http://openid.net/specs/oauth-v2-multiple-response-types-1_0.html)：可选。针对OAuth2的扩展，提供几个新的response_type。
- [OAuth 2.0 Form Post Response Mode](http://openid.net/specs/oauth-v2-form-post-response-mode-1_0.html)：可选。针对OAuth2的扩展，OAuth2回传信息给客户端是通过URL的querystring和fragment这两种方式，这个扩展标准提供了一基于form表单的形式把数据post给客户端的机制。
- [Session Management](http://openid.net/specs/openid-connect-session-1_0.html)：可选。Session管理，用于规范OIDC服务如何管理Session信息。
- [Front-Channel Logout](http://openid.net/specs/openid-connect-frontchannel-1_0.html)：可选。基于前端的注销机制，使得RP可以不使用OP的iframe来退出。
- [Back-Channel Logout](http://openid.net/specs/openid-connect-backchannel-1_0.html)：可选。基于后端的注销机制，定义了RP和OP直接如何通信来完成注销。
- [OpenID Connect Federation](http://openid.net/specs/openid-connect-federation-1_0.html) – 可选。定义OPs和RPs如何通过使用联合操作来建立信任

## OIDC core

OAuth2提供了Access Token来解决授权第三方客户端访问受保护资源的问题；OIDC在这个基础上提供了ID Token来解决第三方客户端标识用户身份认证的问题。OIDC的核心在于在OAuth2的授权流程中，一并提供用户的身份认证信息（ID Token）给到第三方客户端，ID Token使用JWT格式来包装，得益于JWT（JSON Web Token）的自包含性，紧凑性以及防篡改机制，使得ID Token可以安全的传递给第三方客户端程序并且容易被验证。此外还提供了UserInfo的接口，用户获取用户的更完整的信息。

### 1. 主要术语

主要的术语以及概念介绍，[完整术语](https://openid.net/specs/openid-connect-core-1_0.html#Terminology)

- EU：End User：终端用户
- RP：Relying Party , 用来代指OAuth2中的受信任的client，身份认证和授权信息的消费方
- OP：OpenID Provider，用来提供EU认证的服务（比如OAuth2中的授权服务），用来为RP提供EU的身份认证信息
- ID Token：JWT格式的数据，包含EU身份认证的信息。
- UserInfo Endpoint：用户信息接口（受OAuth2保护），当RP使用Access Token访问时，返回授权用户的信息，此接口必须使用HTTPS。

### 2. 流程
从抽象的角度来看，OIDC的流程由以下5个步骤构成

- RP (Client) 发一个请求给 OpenID Provider (OP).
- OP 对 End-User 认证然后提供授权.
- OP 返回 ID Token (通常也会带上 Access Token) 给 RP
- RP 使用 Access Token 去请求 UserInfo Endpoint.
- OP 返回 End-User 的用户信息.


      +--------+                                   +--------+
      |        |                                   |        |
      |        |---------(1) AuthN Request-------->|        |
      |        |                                   |        |
      |        |  +--------+                       |        |
      |        |  |        |                       |        |
      |        |  |  End-  |<--(2) AuthN & AuthZ-->|        |
      |        |  |  User  |                       |        |
      |   RP   |  |        |                       |   OP   |
      |        |  +--------+                       |        |
      |        |                                   |        |
      |        |<--------(3) AuthN Response--------|        |
      |        |                                   |        |
      |        |---------(4) UserInfo Request----->|        |
      |        |                                   |        |
      |        |<--------(5) UserInfo Response-----|        |
      |        |                                   |        |
      +--------+                                   +--------+


AuthN=Authentication，表示认证. AuthZ=Authorization，代表授权

### 3 ID Token

OIDC对OAuth2最主要的扩展就是提供了ID Token(就是它试用户被认证了)。ID Token是一个安全令牌，是一个授权服务器提供的包含用户信息（由一组Cliams构成以及其他辅助的Cliams）的JWT格式的数据结构

- iss (Issuer Identifier)：必须。提供认证信息者的唯一标识。一般是一个https的url（不包含querystring和fragment部分）。
- sub (Subject Identifier)：必须。iss提供的EU的标识，在iss范围内唯一。它会被RP用来标识唯一的用户。最长为255个ASCII个字符。
- aud (Audience(s))：必须。标识ID Token的受众。必须包含OAuth2的client_id。通常情况是个包含敏感字符串的数组
- exp（Expiration time）：必须。过期时间，超过此时间的ID Token会作废不再被验证通过。
- iat（Issued At Time）：必须。JWT的构建的时间。
- auth_time (AuthenticationTime)：EU完成认证的时间。如果RP发送AuthN请求的时候携带max_age的参数，则此Claim是必须的。
- nonce：RP发送请求的时候提供的随机字符串，用来减缓重放攻击，也可以来关联ID Token和RP本身的Session信息。
- acr (Authentication Context Class Reference)：可选。表示一个认证上下文引用值，可以用来标识认证上下文类。
- amr (Authentication Methods References)：可选。表示一组认证方法。
- azp (Authorized party)：可选。结合aud使用。只有在被认证的一方和受众（aud）不一致时才使用此值，一般情况下很少使用。

ID Token通常情况下还会包含其他的Claims, 毕竟上述claim中只有sub是和EU相关的，这在一般情况下是不够的，必须还需要EU的用户名，头像等其他的资料，OIDC提供了一组[公共的cliams](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims)

一个ID Token的例子如下:
```
  {
   "iss": "https://server.example.com",
   "sub": "24400320",
   "aud": "s6BhdRkqt3",
   "nonce": "n-0S6_WzA2Mj",
   "exp": 1311281970,
   "iat": 1311280970,
   "auth_time": 1311280969,
   "acr": "urn:mace:incommon:iap:silver"
  }
```

### 4 认证 Authentication
下面就看一下OIDC如何获取到ID Token，因为OIDC基于OAuth2，所以OIDC的认证流程主要是由OAuth2的几种授权流程延伸而来的，有以下3种：

- Authorization Code Flow：使用OAuth2的授权码来换取Id Token和Access Token。
- Implicit Flow：使用OAuth2的Implicit流程获取Id Token和Access Token。
- Hybrid Flow：混合Authorization Code Flow+Implici Flow。

以下是关于三种流程的一些总结：

|   Property  | Authorization Code Flow	  | Implicit Flow	 | Hybrid Flow |
|  ----  | ----  |  ----  | ----  |
| All tokens returned from Authorization Endpoint  | no | yes  | no |
| All tokens returned from Token Endpoint  | yes | no  | no |
| Tokens not revealed to User Agent  | yes | no  | no |
| Client can be authenticated  | yes | no  | yes |
| Refresh Token possible  | yes | no  | yes |
| Communication in one round trip  | no | yes  | no |
| Most communication server-to-server  | yes | no  | varies |

关于 response_type 与 三种流程的应用关系如下:

| "response_type" value |	Flow |
| ---- | ---- |
| code | Authorization Code Flow |
| id_token |	Implicit Flow |
| id_token token |	Implicit Flow |
| code id_token |	Hybrid Flow |
| code token |	Hybrid Flow |
| code id_token token |	Hybrid Flow |

#### 4.1 基于Authorization Code的认证请求

Authorization Code 流程步骤

- 客户端准备好认证请求
- 客户端发送请求到认证服务器
- 授权服务器认证用户
- 授权服务器获得用户的授权
- 授权服务器返回授权码给客户端
- 客户端向 Token Endpoint 发送请求并带上授权码
- 客户端收到 ID token 和 access token
- 客户端验证ID令牌并检索最终用户的主题标识符

这种方式使用OAuth2的Authorization Code的方式来完成用户身份认证，所有的Token都是通过Token EndPoint 来发放的。构建一个OIDC的Authentication Request需要提供如下的参数：

- scope：必须。OIDC的请求必须包含值为“openid”的scope的参数。
- response_type：必选。同OAuth2。
- client_id：必选。同OAuth2。
- redirect_uri：必选。同OAuth2。
- state：推荐。同OAuth2。防止CSRF, XSRF。

以上这5个参数是和OAuth2相同的。除此之外，还定义了[其他参数](https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest)

- response_mode：可选。OIDC新定义的参数, 用来指定Authorization Endpoint以何种方式返回数据。
- nonce：可选。ID Token中的出现的nonce就是来源于此。
- display ： 可选。指示授权服务器呈现怎样的界面给EU。有效值有（page，popup，touch，wap），其中默认是page。page=普通的页面，popup=弹出框，touch=支持触控的页面，wap=移动端页面。
- prompt：可选。这个参数允许传递多个值，使用空格分隔。用来指示授权服务器是否引导EU重新认证和同意授权（consent，就是EU完成身份认证后的确认同意授权的页面）。有效值有（none，login，consent，select_account）。none=不实现现任何认证和确认同意授权的页面，如果没有认证授权过，则返回错误login_required或interaction_required。login=重新引导EU进行身份认证，即使已经登录。consent=重新引导EU确认同意授权。select_account=假如EU在授权服务器有多个账号的话，允许EU选择一个账号进行认证。
- max_age：可选。代表EU认证信息的有效时间，对应ID Token中auth_time的claim。比如设定是20分钟，则超过了时间，则需要引导EU重新认证。
- ui_locales：可选。用户界面的本地化语言设置项。
- id_token_hint：可选。之前发放的ID Token，如果ID Token经过验证且是有效的，则需要返回一个正常的响应；如果有误，则返回对应的错误提示。
- login_hint：可选。向授权服务器提示登录标识符，EU可能会使用它登录(如果需要的话)。比如指定使用用户使用blackheart账号登录，当然EU也可以使用其他账号登录，这只是类似html中input元素的placeholder。
- acr_values：可选。Authentication Context Class Reference values，对应ID Token中的acr的Claim。此参数允许多个值出现，使用空格分割。

一个简单的请求列子如下：
```
HTTP/1.1 302 Found
Location: https://server.example.com/authorize?
  response_type=code
  &scope=openid%20profile%20email
  &client_id=s6BhdRkqt3
  &state=af0ifjsldkj
  &redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb
```
用户登录之后，认证服务器根据redirect_uri 拼接重定向地址，如下
```
  HTTP/1.1 302 Found
  Location: https://client.example.org/cb?code=SplxlOBeZQQYbYS6WxSbIA&state=af0ifjsldkj
```

客户端接下来发送获取token 的请求
```
  POST /token HTTP/1.1
  Host: server.example.com
  Content-Type: application/x-www-form-urlencoded
  Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW

  grant_type=authorization_code&code=SplxlOBeZQQYbYS6WxSbIA&redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb
```

然后Token EndPoint会返回响应的Token，其中除了OAuth2规定的部分数据外，还会附加一个id_token的字段。id_token字段就是上面提到的ID Token。例如：


      HTTP/1.1 200 OK
      Content-Type: application/json
      Cache-Control: no-store
      Pragma: no-cache

      {
      "access_token": "SlAV32hkKG",
      "token_type": "Bearer",
      "refresh_token": "8xLOxBtZp8",
      "expires_in": 3600,
      "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOWdkazcifQ.ewogImlzc
        yI6ICJodHRwOi8vc2VydmVyLmV4YW1wbGUuY29tIiwKICJzdWIiOiAiMjQ4Mjg5
        NzYxMDAxIiwKICJhdWQiOiAiczZCaGRSa3F0MyIsCiAibm9uY2UiOiAibi0wUzZ
        fV3pBMk1qIiwKICJleHAiOiAxMzExMjgxOTcwLAogImlhdCI6IDEzMTEyODA5Nz
        AKfQ.ggW8hZ1EuVLuxNuuIJKX_V8a_OMXzR0EHR9R6jgdqrOOF4daGU96Sr_P6q
        Jp6IcmD3HP99Obi1PRs-cwh3LO-p146waJ8IhehcwL7F09JdijmBqkvPeB2T9CJ
        NqeGpe-gccMg4vfKjkM8FcGvnzZUN4_KSP0aAp1tOJ1zZwgjxqGByKHiOtX7Tpd
        QyHE5lcMiKPXfEIQILVq0pc_E2DzL7emopWoaoZTF_m0_N0YzFC6g6EJbOEoRoS
        K5hoDalrcvRYLSrQAZZKflyuVCyixEoV9GfNQC3_osjzw2PAithfubEEBLuVVk4
        XUVrWOLrLl0nx7RkKU8NXNHq-rvKMzqg"
      }


在RP拿到这些信息之后，需要对id_token以及access_token进行验证,[参考](https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation)。至此，可以说用户身份认证就可以完成了，后续可以根据UserInfo EndPoint获取更完整的信息。

[Implicit Flow](https://openid.net/specs/openid-connect-core-1_0.html#ImplicitFlowAuth)和[Hybrid Flow](https://openid.net/specs/openid-connect-core-1_0.html#HybridFlowAuth)

#### UserInfo Endpoint

UserIndo EndPoint是一个受OAuth2保护的资源。在RP得到Access Token后可以请求此资源，然后获得一组EU相关的Claims，这些信息可以说是ID Token的扩展，比如如果你觉得ID Token中只需包含EU的唯一标识sub即可（避免ID Token过于庞大），然后通过此接口获取完整的EU的信息。

userinfo endpoint 请求例子

```
  GET /userinfo HTTP/1.1
  Host: server.example.com
  Authorization: Bearer SlAV32hkKG
```

成功的返回信息
 
      HTTP/1.1 200 OK
        Content-Type: application/json

        {
        "sub": "248289761001",
        "name": "Jane Doe",
        "given_name": "Jane",
        "family_name": "Doe",
        "preferred_username": "j.doe",
        "email": "janedoe@example.com",
        "picture": "http://example.com/janedoe/me.jpg"
        }

更多的属性信息参考OIDC提供的一组[公共的cliams](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims)


## OIDC Discovery

Discovery定义了一个服务发现的规范，它定义了一个api（ /.well-known/openid-configuration ），这个api返回一个json数据结构，其中包含了一些OIDC中提供的服务以及其支持情况的描述信息，这样可以使得oidc服务的RP可以不再硬编码OIDC服务接口信息。请求如下
```
 GET /.well-known/openid-configuration HTTP/1.1
  Host: example.com
```
成功的返回如下

      HTTP/1.1 200 OK
      Content-Type: application/json

        {
        "issuer":
          "https://server.example.com",
        "authorization_endpoint":
          "https://server.example.com/connect/authorize",
        "token_endpoint":
          "https://server.example.com/connect/token",
        "token_endpoint_auth_methods_supported":
          ["client_secret_basic", "private_key_jwt"],
        "token_endpoint_auth_signing_alg_values_supported":
          ["RS256", "ES256"],
        "userinfo_endpoint":
          "https://server.example.com/connect/userinfo",
        "check_session_iframe":
          "https://server.example.com/connect/check_session",
        "end_session_endpoint":
          "https://server.example.com/connect/end_session",
        "jwks_uri":
          "https://server.example.com/jwks.json",
        "registration_endpoint":
          "https://server.example.com/connect/register",
        "scopes_supported":
          ["openid", "profile", "email", "address",
            "phone", "offline_access"],
        "response_types_supported":
          ["code", "code id_token", "id_token", "token id_token"],
        "acr_values_supported":
          ["urn:mace:incommon:iap:silver",
            "urn:mace:incommon:iap:bronze"],
        "subject_types_supported":
          ["public", "pairwise"],
        "userinfo_signing_alg_values_supported":
          ["RS256", "ES256", "HS256"],
        "userinfo_encryption_alg_values_supported":
          ["RSA1_5", "A128KW"],
        "userinfo_encryption_enc_values_supported":
          ["A128CBC-HS256", "A128GCM"],
        "id_token_signing_alg_values_supported":
          ["RS256", "ES256", "HS256"],
        "id_token_encryption_alg_values_supported":
          ["RSA1_5", "A128KW"],
        "id_token_encryption_enc_values_supported":
          ["A128CBC-HS256", "A128GCM"],
        "request_object_signing_alg_values_supported":
          ["none", "RS256", "ES256"],
        "display_values_supported":
          ["page", "popup"],
        "claim_types_supported":
          ["normal", "distributed"],
        "claims_supported":
          ["sub", "iss", "auth_time", "acr",
            "name", "given_name", "family_name", "nickname",
            "profile", "picture", "website",
            "email", "email_verified", "locale", "zoneinfo",
            "http://example.info/claims/groups"],
        "claims_parameter_supported":
          true,
        "service_documentation":
          "http://server.example.com/connect/service_documentation.html",
        "ui_locales_supported":
          ["en-US", "en-GB", "en-CA", "fr-FR", "fr-CA"]
        }


具体属性含义[参考](https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata)
