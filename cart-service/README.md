# Commerce Tools Dovetech Extension

```
#!/bin/sh
curl -sH "Authorization: Bearer ACCESS_TOKEN" https://api.{region}.commercetools.com/{projectKey}/types -d @- << EOF
{
  "key": "dovetech-cartMetadata",
  "name": { "en": "Dovetech Cart Metadata" },
  "resourceTypeIds": ["order"],
  "fieldDefinitions": [
    {
      "type": {
        "name": "String"
      },
      "name": "dovetech-couponCodes",
      "label": {
        "en": "Dovetech Coupon Codes"
      },
      "required": false,
      "inputHint": "SingleLine"
    },
    {
      "type": {
        "name": "String"
      },
      "name": "dovetech-cartAction",
      "label": {
        "en": "Dovetech Cart Action"
      },
      "required": false,
      "inputHint": "SingleLine"
    }
  ]
}
EOF
```
