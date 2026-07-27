from pathlib import Path
from xml.sax.saxutils import escape

OUT_DIR = Path('/Users/kamil/Desktop/Meomul/docs/assets')
OUT_DIR.mkdir(parents=True, exist_ok=True)

W = 2500
H = 1820
TITLE_H = 170
BODY_Y = 190

STYLE = '''
<defs>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.28"/>
  </filter>
  <marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
    <path d="M0,0 L12,6 L0,12 z" fill="#c9c9c9"/>
  </marker>
  <style>
    .box-title { font: 700 21px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; fill: #ffffff; }
    .field { font: 500 14px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; fill: #efefef; }
    .type { font: italic 600 13px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; fill: #b9b9b9; }
    .flag { font: 700 12px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; fill: #cfcfcf; }
    .link { stroke: #cbcbcb; stroke-width: 2.5; fill: none; opacity: .95; }
    .link-dashed { stroke: #b7b7b7; stroke-width: 2.2; fill: none; opacity: .9; stroke-dasharray: 8 7; }
    .card { fill: #3a3a3a; }
    .pk { fill: #ffd200; }
    .fk { fill: none; stroke: #d8a543; stroke-width: 1.8; }
    .emb { fill: #58c1f7; }
    .rel-label { font: 600 13px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; fill: #e1e1e1; }
    .end-label { font: 700 12px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; fill: #d6d6d6; }
  </style>
</defs>
'''


def bh(n):
    return 44 + 24 + n * 24 + 18


def anchor(box, side):
    if side == 'left':
        return box['x'], box['y'] + box['h'] / 2
    if side == 'right':
        return box['x'] + box['w'], box['y'] + box['h'] / 2
    if side == 'top':
        return box['x'] + box['w'] / 2, box['y']
    return box['x'] + box['w'] / 2, box['y'] + box['h']


def default_sides(a, b):
    ax = a['x'] + a['w'] / 2
    ay = a['y'] + a['h'] / 2
    bx = b['x'] + b['w'] / 2
    by = b['y'] + b['h'] / 2
    dx, dy = bx - ax, by - ay
    if abs(dx) >= abs(dy):
        return ('right', 'left') if dx > 0 else ('left', 'right')
    return ('bottom', 'top') if dy > 0 else ('top', 'bottom')


def curve(a, sa, b, sb):
    p1 = anchor(a, sa)
    p2 = anchor(b, sb)
    dx, dy = p2[0] - p1[0], p2[1] - p1[1]
    dist = max(abs(dx), abs(dy), 1)
    ox = min(max(max(abs(dx) * 0.42, dist * 0.18), 90), 280)
    oy = min(max(max(abs(dy) * 0.42, dist * 0.18), 70), 240)
    c1 = (
        p1[0] + (ox if sa == 'right' else -ox if sa == 'left' else 0),
        p1[1] + (oy if sa == 'bottom' else -oy if sa == 'top' else 0),
    )
    c2 = (
        p2[0] + (-ox if sb == 'left' else ox if sb == 'right' else 0),
        p2[1] + (-oy if sb == 'top' else oy if sb == 'bottom' else 0),
    )
    return p1, c1, c2, p2


def draw_box(parts, b):
    x, y, w, h = b['x'], b['y'], b['w'], b['h']
    parts.append('<g filter="url(#shadow)">')
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" class="card"/>')
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="36" fill="{b["color"]}"/>')
    parts.append(f'<text x="{x + w/2}" y="{y + 24}" text-anchor="middle" class="box-title">{escape(b["title"])}</text>')
    y0 = y + 52
    for i, (name, typ, flag, kind) in enumerate(b['fields']):
        yy = y0 + i * 24
        if kind == 'pk':
            icon = '<rect x="0" y="0" width="10" height="10" rx="2" class="pk"/>'
        elif kind == 'fk':
            icon = '<rect x="0" y="0" width="10" height="10" rx="2" class="fk"/>'
        elif kind == 'embedded':
            icon = '<circle cx="5" cy="5" r="4.2" class="emb"/>'
        else:
            icon = '<circle cx="5" cy="5" r="3.2" fill="#7a7a7a"/>'
        parts.append(f'<g transform="translate({x+16},{yy-10})">{icon}</g>')
        parts.append(f'<text x="{x+32}" y="{yy}" class="field">{escape(name)}</text>')
        parts.append(f'<text x="{x+w-112}" y="{yy}" class="type">{escape(typ)}</text>')
        parts.append(f'<text x="{x+w-18}" y="{yy}" text-anchor="end" class="flag">{escape(flag)}</text>')
    parts.append('</g>')


def draw_rel(parts, boxes, r):
    a, b = boxes[r['from']], boxes[r['to']]
    sa, sb = r.get('from_side'), r.get('to_side')
    if not sa or not sb:
        sa, sb = default_sides(a, b)
    p1, c1, c2, p2 = curve(a, sa, b, sb)
    klass = 'link-dashed' if r.get('style') == 'dashed' else 'link'
    marker = '' if r.get('style') == 'dashed' else ' marker-end="url(#arrow)"'
    parts.append(f'<path class="{klass}" d="M{p1[0]},{p1[1]} C{c1[0]},{c1[1]} {c2[0]},{c2[1]} {p2[0]},{p2[1]}"{marker}/>')
    mx = (p1[0] + p2[0] + c1[0] + c2[0]) / 4
    my = (p1[1] + p2[1] + c1[1] + c2[1]) / 4
    parts.append(f'<circle cx="{mx}" cy="{my}" r="11" fill="#343434" stroke="#c8c8c8" stroke-width="2"/>')
    parts.append(f'<text x="{mx}" y="{my+4}" text-anchor="middle" class="rel-label">{escape(r["label"][:1].upper())}</text>')
    parts.append(f'<text x="{p1[0]}" y="{p1[1]-9}" text-anchor="middle" class="end-label">{escape(r["from_card"])}</text>')
    parts.append(f'<text x="{p2[0]}" y="{p2[1]-9}" text-anchor="middle" class="end-label">{escape(r["to_card"])}</text>')


boxes = [
    {'id':'members','title':'members','x':930,'y':120,'w':420,'color':'#f4b400','fields':[
        ('_id','objectId','PK','pk'),('memberType','enum','NN','normal'),('memberStatus','enum','NN','normal'),('hostAccessStatus','enum','NN','normal'),
        ('memberAuthType','enum','NN','normal'),('memberPhone','string','UK','normal'),('memberNick','string','UK','normal'),
        ('subscriptionTier','enum','','normal'),('memberPoints','number','','normal'),('memberFollowers','number','','normal'),
        ('memberFollowings','number','','normal'),('memberViews','number','','normal'),('memberLikes','number','','normal'),
        ('memberRank','number','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'host_applications','title':'host_applications','x':90,'y':90,'w':420,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('applicantMemberId','objectId','FK','fk'),('businessName','string','NN','normal'),
        ('businessEmail','string','','normal'),('intendedHotelName','string','','normal'),('hotelType','enum','NN','normal'),
        ('status','enum','NN','normal'),('reviewedByMemberId','objectId','FK','fk'),('reviewedAt','date','','normal'),('createdAt','date','','normal')
    ]},
    {'id':'likes','title':'likes','x':90,'y':430,'w':340,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('likeGroup','enum','NN','normal'),('likeRefId','objectId','NN','normal'),
        ('memberId','objectId','FK','fk'),('createdAt','date','','normal')
    ]},
    {'id':'views','title':'views','x':90,'y':690,'w':340,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('viewGroup','enum','NN','normal'),('viewRefId','objectId','NN','normal'),
        ('memberId','objectId','FK','fk'),('createdAt','date','','normal')
    ]},
    {'id':'follows','title':'follows','x':90,'y':950,'w':340,'color':'#ff4747','fields':[
        ('_id','objectId','PK','pk'),('followerId','objectId','FK','fk'),('followingId','objectId','FK','fk'),('createdAt','date','','normal')
    ]},
    {'id':'search_history','title':'searchhistories','x':470,'y':1240,'w':420,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('memberId','objectId','FK','fk'),('location','enum','','normal'),
        ('priceMin','number','','normal'),('priceMax','number','','normal'),('purpose','enum','','normal'),
        ('guestCount','number','','normal'),('text','string','','normal'),('fingerprint','string','','normal'),('createdAt','date','','normal')
    ]},
    {'id':'hotels','title':'hotels','x':980,'y':620,'w':460,'color':'#76c442','fields':[
        ('_id','objectId','PK','pk'),('memberId','objectId','FK','fk'),('hotelType','enum','NN','normal'),
        ('hotelTitle','string','NN','normal'),('hotelDesc','string','','normal'),('hotelLocation','enum','NN','normal'),
        ('starRating','number','','normal'),('verificationStatus','enum','','normal'),('badgeLevel','enum','','normal'),
        ('cancellationPolicy','enum','','normal'),('hotelViews','number','','normal'),('hotelLikes','number','','normal'),
        ('hotelReviews','number','','normal'),('hotelRating','number','','normal'),('hotelRank','number','','normal'),
        ('startingPrice','number','','normal'),('warningStrikes','number','','normal'),('hotelStatus','enum','','normal'),
        ('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'rooms','title':'rooms','x':1000,'y':1245,'w':420,'color':'#76c442','fields':[
        ('_id','objectId','PK','pk'),('hotelId','objectId','FK','fk'),('roomType','enum','NN','normal'),
        ('roomNumber','string','','normal'),('roomName','string','NN','normal'),('maxOccupancy','number','NN','normal'),
        ('bedType','enum','NN','normal'),('bedCount','number','NN','normal'),('basePrice','number','NN','normal'),
        ('weekendSurcharge','number','','normal'),('roomSize','number','','normal'),('viewType','enum','','normal'),
        ('totalRooms','number','NN','normal'),('availableRooms','number','NN','normal'),('currentViewers','number','','normal'),
        ('roomStatus','enum','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'bookings','title':'bookings','x':1810,'y':1260,'w':500,'color':'#76c442','fields':[
        ('_id','objectId','PK','pk'),('guestId','objectId','FK','fk'),('hotelId','objectId','FK','fk'),
        ('checkInDate','date','NN','normal'),('checkOutDate','date','NN','normal'),('nights','number','NN','normal'),
        ('adultCount','number','NN','normal'),('childCount','number','','normal'),('subtotal','number','NN','normal'),
        ('totalPrice','number','NN','normal'),('paymentMethod','enum','NN','normal'),('paymentStatus','enum','','normal'),
        ('bookingStatus','enum','','normal'),('cancelledByMemberId','objectId','FK','fk'),('bookingCode','string','UK','normal'),
        ('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'reviews','title':'reviews','x':1810,'y':180,'w':420,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('reviewerId','objectId','FK','fk'),('hotelId','objectId','FK','fk'),
        ('bookingId','objectId','FK','fk'),('verifiedStay','bool','','normal'),('stayDate','date','NN','normal'),
        ('overallRating','number','NN','normal'),('reviewTitle','string','','normal'),('reviewText','string','NN','normal'),
        ('helpfulCount','number','','normal'),('reviewViews','number','','normal'),('reviewStatus','enum','','normal'),
        ('createdAt','date','','normal')
    ]},
    {'id':'chats','title':'chats','x':1810,'y':700,'w':500,'color':'#f4b400','fields':[
        ('_id','objectId','PK','pk'),('guestId','objectId','FK','fk'),('hotelId','objectId','FK','fk'),
        ('chatScope','enum','NN','normal'),('assignedAgentId','objectId','FK','fk'),('bookingId','objectId','FK','fk'),
        ('supportTopic','string','','normal'),('sourcePath','string','','normal'),('chatStatus','enum','','normal'),
        ('unreadGuestMessages','number','','normal'),('unreadAgentMessages','number','','normal'),('lastMessageAt','date','','normal'),
        ('createdAt','date','','normal')
    ]},
]


rels = [
    {'from':'members','to':'host_applications','from_card':'1','to_card':'N','label':'applies','from_side':'left','to_side':'right'},
    {'from':'members','to':'host_applications','from_card':'1','to_card':'0..N','label':'reviews','from_side':'left','to_side':'bottom','style':'dashed'},
    {'from':'members','to':'follows','from_card':'1','to_card':'N','label':'follower','from_side':'left','to_side':'right'},
    {'from':'members','to':'follows','from_card':'1','to_card':'N','label':'following','from_side':'bottom','to_side':'right','style':'dashed'},
    {'from':'members','to':'likes','from_card':'1','to_card':'N','label':'likes','from_side':'left','to_side':'right'},
    {'from':'members','to':'views','from_card':'1','to_card':'N','label':'views','from_side':'left','to_side':'right'},
    {'from':'likes','to':'hotels','from_card':'N*','to_card':'N*','label':'target','from_side':'right','to_side':'left','style':'dashed'},
    {'from':'views','to':'hotels','from_card':'N*','to_card':'N*','label':'target','from_side':'right','to_side':'left','style':'dashed'},
    {'from':'members','to':'search_history','from_card':'1','to_card':'N','label':'searches','from_side':'bottom','to_side':'top'},
    {'from':'members','to':'hotels','from_card':'1','to_card':'N','label':'owns','from_side':'bottom','to_side':'top'},
    {'from':'hotels','to':'rooms','from_card':'1','to_card':'N','label':'rooms','from_side':'bottom','to_side':'top'},
    {'from':'members','to':'bookings','from_card':'1','to_card':'N','label':'guest','from_side':'right','to_side':'left'},
    {'from':'hotels','to':'bookings','from_card':'1','to_card':'N','label':'hotel','from_side':'right','to_side':'left'},
    {'from':'members','to':'reviews','from_card':'1','to_card':'N','label':'reviewer','from_side':'right','to_side':'left'},
    {'from':'hotels','to':'reviews','from_card':'1','to_card':'N','label':'hotel','from_side':'right','to_side':'left'},
    {'from':'bookings','to':'reviews','from_card':'1','to_card':'0..1','label':'review','from_side':'top','to_side':'bottom'},
    {'from':'members','to':'chats','from_card':'1','to_card':'N','label':'guest','from_side':'right','to_side':'left'},
    {'from':'members','to':'chats','from_card':'1','to_card':'0..N','label':'agent','from_side':'right','to_side':'top','style':'dashed'},
    {'from':'hotels','to':'chats','from_card':'1','to_card':'N','label':'hotel','from_side':'right','to_side':'left'},
    {'from':'bookings','to':'chats','from_card':'1','to_card':'0..N','label':'context','from_side':'top','to_side':'bottom'},
]


for b in boxes:
    b['h'] = bh(len(b['fields']))

box_map = {b['id']: b for b in boxes}

parts = []
ap = parts.append
ap(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">')
ap(STYLE)
ap(f'<rect x="0" y="0" width="{W}" height="{H}" fill="#245f68"/>')
ap(f'<rect x="0" y="0" width="{W}" height="{H}" fill="#343434"/>')
for r in rels:
    draw_rel(parts, box_map, r)
for b in boxes:
    draw_box(parts, b)
ap('</svg>')
out = OUT_DIR / 'meomul-er-model-schemas-only.svg'
out.write_text(''.join(parts), encoding='utf-8')
print(out)
