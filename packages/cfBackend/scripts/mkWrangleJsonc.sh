#!/bin/bash
source wrangler.vars

export CF_ACCOUNT_ID
export R2_PUBLIC_ACCESS_KEY_ID
export R2_PUBLIC_PREFIX_URL

envsubst < wrangler.template.jsonc > wrangler.jsonc

