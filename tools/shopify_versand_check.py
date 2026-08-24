#!/usr/bin/env python3
"""Fragt Shopify, was der Versand je Land tatsaechlich kostet — ueber die
Storefront-Schnittstelle, die auch der Warenkorb der Website benutzt."""
import io, json, re, subprocess

s = io.open('js/data.js', encoding='utf-8').read()
domain = re.search(r'"domain": "([^"]+)"', s).group(1)
token  = re.search(r'"storefrontAccessToken": "([^"]+)"', s).group(1)
API = f'https://{domain}/api/2024-10/graphql.json'

def gql(query, variables=None):
    r = subprocess.run(['curl', '-s', API, '-H', 'Content-Type: application/json',
                        '-H', f'X-Shopify-Storefront-Access-Token: {token}',
                        '-d', json.dumps({'query': query, 'variables': variables or {}})],
                       capture_output=True, text=True)
    return json.loads(r.stdout)

# eine kaufbare Variante holen
d = gql('{ products(first: 1) { nodes { title variants(first:1){ nodes { id availableForSale } } } } }')
v = d['data']['products']['nodes'][0]
vid = v['variants']['nodes'][0]['id']
print('Testuhr:', v['title'])

LAENDER = [('DE', 'Deutschland', 'Germany',       'Neue Mainzer Str. 46', 'Frankfurt', '60311'),
           ('AT', 'Österreich',   'Austria',       'Teststr. 1',          'Wien',      '1010'),
           ('FR', 'Frankreich',   'France',        'Rue de Test 1',       'Paris',     '75001'),
           ('CH', 'Schweiz',      'Switzerland',   'Teststr. 1',          'Zürich',    '8001'),
           ('US', 'USA',          'United States', '1 Test Ave',          'New York',  '10001')]

ERSTELLEN = """
mutation($lines:[CartLineInput!]!, $b:CartBuyerIdentityInput!){
  cartCreate(input:{lines:$lines, buyerIdentity:$b}){
    cart { id
      deliveryGroups(first:5){ nodes { deliveryOptions { title estimatedCost { amount currencyCode } } } }
      cost { subtotalAmount { amount } } }
    userErrors { field message } } }"""

for code, name, land, str_, ort, plz in LAENDER:
    b = {'countryCode': code, 'deliveryAddressPreferences': [{'deliveryAddress': {
         'address1': str_, 'city': ort, 'zip': plz, 'country': land, 'province': None,
         'firstName': 'Max', 'lastName': 'Muster'}}]}
    res = gql(ERSTELLEN, {'lines': [{'merchandiseId': vid, 'quantity': 1}], 'b': b})
    cc = (res.get('data') or {}).get('cartCreate') or {}
    if cc.get('userErrors'):
        print(f'{name:12} Fehler: {cc["userErrors"]}'); continue
    gruppen = cc['cart']['deliveryGroups']['nodes']
    opts = [o for g in gruppen for o in g['deliveryOptions']]
    if not opts:
        print(f'{name:12} keine Versandart hinterlegt  <-- Shopify wuerde hier nicht liefern')
    for o in opts:
        print(f'{name:12} {o["title"]:34} {float(o["estimatedCost"]["amount"]):>8.2f} {o["estimatedCost"]["currencyCode"]}')
