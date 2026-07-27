from pathlib import Path
from xml.sax.saxutils import escape

OUT_DIR = Path('/Users/kamil/Desktop/Meomul/docs/assets')
OUT_DIR.mkdir(parents=True, exist_ok=True)

W = 2600
H = 2400
TITLE_H = 170
BODY_Y = 190

STYLE = '''
<defs>
  <linearGradient id="titleGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff"/>
    <stop offset="100%" stop-color="#eef4fb"/>
  </linearGradient>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.28"/>
  </filter>
  <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.18"/>
  </filter>
  <marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
    <path d="M0,0 L12,6 L0,12 z" fill="#c9c9c9"/>
  </marker>
  <style>
    .title { font: 300 74px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; fill: #4a88ca; }
    .subtitle { font: 500 18px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; fill: #8ea8c4; }
    .section { font: 700 20px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; fill: #d2d2d2; }
    .group-title { font: 700 18px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; fill: #ecf2f8; letter-spacing: .02em; }
    .group-subtitle { font: 500 12px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; fill: #9fb0c2; }
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
    .legend { font: 500 14px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; fill: #d6d6d6; }
  </style>
</defs>
'''


def bh(n):
    return 44 + 24 + n * 24 + 18


def anchor(box, side):
    if side == 'left':
        return box['x'], box['y'] + box['h']/2
    if side == 'right':
        return box['x'] + box['w'], box['y'] + box['h']/2
    if side == 'top':
        return box['x'] + box['w']/2, box['y']
    return box['x'] + box['w']/2, box['y'] + box['h']


def default_sides(a,b):
    ax = a['x'] + a['w']/2
    ay = a['y'] + a['h']/2
    bx = b['x'] + b['w']/2
    by = b['y'] + b['h']/2
    dx, dy = bx-ax, by-ay
    if abs(dx) >= abs(dy):
        return ('right','left') if dx > 0 else ('left','right')
    return ('bottom','top') if dy > 0 else ('top','bottom')


def curve(a,sa,b,sb):
    p1 = anchor(a,sa)
    p2 = anchor(b,sb)
    dx, dy = p2[0] - p1[0], p2[1] - p1[1]
    dist = max(abs(dx), abs(dy), 1)
    ox = min(max(max(abs(dx) * 0.42, dist * 0.18), 90), 280)
    oy = min(max(max(abs(dy) * 0.42, dist * 0.18), 70), 240)
    c1 = (p1[0] + (ox if sa=='right' else -ox if sa=='left' else 0), p1[1] + (oy if sa=='bottom' else -oy if sa=='top' else 0))
    c2 = (p2[0] + (-ox if sb=='left' else ox if sb=='right' else 0), p2[1] + (-oy if sb=='top' else oy if sb=='bottom' else 0))
    return p1, c1, c2, p2


def draw_box(parts,b):
    x,y,w,h=b['x'],b['y'],b['w'],b['h']
    parts.append('<g filter="url(#shadow)">')
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" class="card"/>')
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="36" fill="{b["color"]}"/>')
    parts.append(f'<text x="{x+w/2}" y="{y+24}" text-anchor="middle" class="box-title">{escape(b["title"])}</text>')
    y0 = y + 52
    for i,(name,typ,flag,kind) in enumerate(b['fields']):
        yy = y0 + i*24
        if kind=='pk':
            icon='<rect x="0" y="0" width="10" height="10" rx="2" class="pk"/>'
        elif kind=='fk':
            icon='<rect x="0" y="0" width="10" height="10" rx="2" class="fk"/>'
        elif kind=='embedded':
            icon='<circle cx="5" cy="5" r="4.2" class="emb"/>'
        else:
            icon='<circle cx="5" cy="5" r="3.2" fill="#7a7a7a"/>'
        parts.append(f'<g transform="translate({x+16},{yy-10})">{icon}</g>')
        parts.append(f'<text x="{x+32}" y="{yy}" class="field">{escape(name)}</text>')
        parts.append(f'<text x="{x+w-112}" y="{yy}" class="type">{escape(typ)}</text>')
        parts.append(f'<text x="{x+w-18}" y="{yy}" text-anchor="end" class="flag">{escape(flag)}</text>')
    parts.append('</g>')


def draw_rel(parts, boxes, r):
    a, b = boxes[r['from']], boxes[r['to']]
    sa, sb = r.get('from_side'), r.get('to_side')
    if not sa or not sb:
        sa,sb = default_sides(a,b)
    p1,c1,c2,p2 = curve(a,sa,b,sb)
    klass = 'link-dashed' if r.get('style')=='dashed' else 'link'
    marker = '' if r.get('style')=='dashed' else ' marker-end="url(#arrow)"'
    parts.append(f'<path class="{klass}" d="M{p1[0]},{p1[1]} C{c1[0]},{c1[1]} {c2[0]},{c2[1]} {p2[0]},{p2[1]}"{marker}/>')
    mx = (p1[0]+p2[0]+c1[0]+c2[0])/4
    my = (p1[1]+p2[1]+c1[1]+c2[1])/4
    parts.append(f'<circle cx="{mx}" cy="{my}" r="11" fill="#343434" stroke="#c8c8c8" stroke-width="2"/>')
    parts.append(f'<text x="{mx}" y="{my+4}" text-anchor="middle" class="rel-label">{escape(r["label"][:1].upper())}</text>')
    parts.append(f'<text x="{p1[0]}" y="{p1[1]-9}" text-anchor="middle" class="end-label">{escape(r["from_card"])}</text>')
    parts.append(f'<text x="{p2[0]}" y="{p2[1]-9}" text-anchor="middle" class="end-label">{escape(r["to_card"])}</text>')


def draw_group(parts, g):
    x, y, w, h = g['x'], g['y'], g['w'], g['h']
    fill = g.get('fill', '#3e4854')
    stroke = g.get('stroke', '#57626f')
    title = g['title']
    subtitle = g.get('subtitle', '')
    parts.append('<g>')
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="26" fill="{fill}" fill-opacity="0.42" stroke="{stroke}" stroke-width="1.6"/>')
    parts.append(f'<rect x="{x+18}" y="{y+18}" width="{w-36}" height="56" rx="18" fill="#313841" fill-opacity="0.75" stroke="{stroke}" stroke-opacity="0.55"/>')
    parts.append(f'<text x="{x+38}" y="{y+52}" class="group-title">{escape(title)}</text>')
    if subtitle:
        parts.append(f'<text x="{x+38}" y="{y+72}" class="group-subtitle">{escape(subtitle)}</text>')
    parts.append('</g>')


def render(filename,title,subtitle,section,boxes,rels,notes,width=W,height=H,groups=None):
    for b in boxes:
        b['h'] = bh(len(b['fields']))
    box_map = {b['id']: b for b in boxes}
    parts=[]; ap=parts.append
    ap(f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">')
    ap(STYLE)
    ap(f'<rect x="0" y="0" width="{width}" height="{height}" fill="#245f68"/>')
    ap(f'<rect x="8" y="14" width="{width-16}" height="{height-22}" rx="18" fill="#ffffff" filter="url(#softShadow)"/>')
    ap(f'<rect x="8" y="14" width="{width-16}" height="{TITLE_H}" rx="18" fill="url(#titleGrad)"/>')
    ap(f'<rect x="8" y="{BODY_Y}" width="{width-16}" height="{height-BODY_Y-8}" fill="#343434"/>')
    ap(f'<text x="{width/2}" y="92" text-anchor="middle" class="title">{escape(title)}</text>')
    ap(f'<text x="{width/2}" y="130" text-anchor="middle" class="subtitle">{escape(subtitle)}</text>')
    for g in groups or []:
        draw_group(parts, g)
    ap(f'<text x="64" y="230" class="section">{escape(section)}</text>')
    for r in rels:
        draw_rel(parts, box_map, r)
    for b in boxes:
        draw_box(parts, b)
    ly = height - 92
    ap(f'<text x="64" y="{ly}" class="legend">Legend:</text>')
    ap(f'<rect x="130" y="{ly-12}" width="10" height="10" rx="2" class="pk"/>')
    ap(f'<text x="150" y="{ly}" class="legend">PK</text>')
    ap(f'<rect x="205" y="{ly-12}" width="10" height="10" rx="2" class="fk"/>')
    ap(f'<text x="225" y="{ly}" class="legend">FK</text>')
    ap(f'<circle cx="315" cy="{ly-7}" r="4.2" class="emb"/>')
    ap(f'<text x="330" y="{ly}" class="legend">embedded / array / value object</text>')
    ap(f'<path d="M620,{ly-7} C670,{ly-7} 700,{ly-7} 750,{ly-7}" class="link-dashed"/>')
    ap(f'<text x="770" y="{ly}" class="legend">derived or polymorphic relation</text>')
    ny = height - 52
    x = 64
    for note in notes:
        ap(f'<text x="{x}" y="{ny}" class="legend">• {escape(note)}</text>')
        x += 620
    ap('</svg>')
    out = OUT_DIR / filename
    out.write_text(''.join(parts), encoding='utf-8')
    return out

PAGES=[]

# Page 1: Member/Auth/Social
PAGES.append(dict(
filename='meomul-er-model-01-members-auth.svg',
title='Meomul ER Model I',
subtitle='Members, auth, host application, notifications and social graph',
section='Page 1 · Members & Auth',
boxes=[
    {'id':'members','title':'members','x':920,'y':260,'w':420,'color':'#f4b400','fields':[
        ('_id','objectId','PK','pk'),('memberType','enum','NN','normal'),('memberStatus','enum','NN','normal'),('hostAccessStatus','enum','NN','normal'),
        ('memberAuthType','enum','NN','normal'),('memberPhone','string','UK','normal'),('memberNick','string','UK','normal'),('memberPassword','string','NN','normal'),
        ('memberFullName','string','','normal'),('memberImage','string','','normal'),('memberAddress','string','','normal'),('memberDesc','string','','normal'),
        ('subscriptionTier','enum','','normal'),('subscriptionExpiry','date','','normal'),('memberPoints','number','','normal'),('memberBadges[]','array','','embedded'),
        ('memberProperties','number','','normal'),('memberArticles','number','','normal'),('memberFollowers','number','','normal'),('memberFollowings','number','','normal'),
        ('memberViews','number','','normal'),('memberLikes','number','','normal'),('memberComments','number','','normal'),('memberRank','number','','normal'),
        ('deletedAt','date','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'host_applications','title':'host_applications','x':1760,'y':180,'w':420,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('applicantMemberId','objectId','FK','fk'),('businessName','string','NN','normal'),('businessDescription','string','NN','normal'),
        ('contactPhone','string','','normal'),('businessEmail','string','','normal'),('intendedHotelName','string','','normal'),('intendedHotelLocation','enum','','normal'),
        ('hotelType','enum','NN','normal'),('suitableFor[]','array','','embedded'),('notes','string','','normal'),('status','enum','NN','normal'),
        ('reviewedByMemberId','objectId','FK','fk'),('reviewNote','string','','normal'),('reviewedAt','date','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'notifications','title':'notifications','x':1760,'y':820,'w':380,'color':'#8a8a8a','fields':[
        ('_id','objectId','PK','pk'),('userId','objectId','FK','fk'),('type','enum','NN','normal'),('title','string','NN','normal'),('message','string','NN','normal'),('link','string','','normal'),('read','bool','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'follows','title':'follows','x':1760,'y':1220,'w':360,'color':'#ff4747','fields':[
        ('_id','objectId','PK','pk'),('followerId','objectId','FK','fk'),('followingId','objectId','FK','fk'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'refresh_tokens','title':'refreshTokens','x':420,'y':1220,'w':360,'color':'#8a8a8a','fields':[
        ('_id','objectId','PK','pk'),('tokenHash','string','UK','normal'),('memberId','objectId','FK','fk'),('expiresAt','date','NN','normal'),('revoked','bool','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'analytics_events','title':'analytics_events','x':380,'y':700,'w':400,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('memberId','objectId','FK','fk'),('memberType','enum','NN','normal'),('eventName','string','NN','normal'),('eventPath','string','','normal'),('payload','string','','normal'),('source','string','','normal'),('userAgent','string','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
],
rels=[
    {'from':'members','to':'host_applications','from_card':'1','to_card':'N','label':'applies'},
    {'from':'members','to':'host_applications','from_card':'1','to_card':'0..N','label':'reviews','from_side':'right','to_side':'top','style':'dashed'},
    {'from':'members','to':'notifications','from_card':'1','to_card':'N','label':'receives'},
    {'from':'members','to':'follows','from_card':'1','to_card':'N','label':'follower'},
    {'from':'members','to':'follows','from_card':'1','to_card':'N','label':'following','from_side':'right','to_side':'top','style':'dashed'},
    {'from':'members','to':'refresh_tokens','from_card':'1','to_card':'N','label':'auth'},
    {'from':'members','to':'analytics_events','from_card':'1','to_card':'N','label':'events'},
],
notes=['All member/auth/social schema fields are included','No host/member/auth fields were collapsed away','Dashed link on follows/reviewer denotes second role relation to Member']
))

# Page 2: Hotel aggregate
PAGES.append(dict(
filename='meomul-er-model-02-hotel-aggregate.svg',
title='Meomul ER Model II',
subtitle='Full hotel aggregate with embedded structures and room domain',
section='Page 2 · Hotel Aggregate',
boxes=[
    {'id':'hotels','title':'hotels','x':980,'y':520,'w':460,'color':'#76c442','fields':[
        ('_id','objectId','PK','pk'),('memberId','objectId','FK','fk'),('hotelType','enum','NN','normal'),('hotelTitle','string','NN','normal'),('hotelDesc','string','','normal'),('hotelLocation','enum','NN','normal'),
        ('starRating','number','','normal'),('checkInTime','string','','normal'),('checkOutTime','string','','normal'),('verificationStatus','enum','','normal'),('badgeLevel','enum','','normal'),('lastInspectionDate','date','','normal'),
        ('cancellationPolicy','enum','','normal'),('ageRestriction','number','','normal'),('petsAllowed','bool','','normal'),('maxPetWeight','number','','normal'),('smokingAllowed','bool','','normal'),('safeStayCertified','bool','','normal'),
        ('suitableFor[]','array','','embedded'),('hotelImages[]','array','','embedded'),('hotelVideos[]','array','','embedded'),('hotelViews','number','','normal'),('hotelLikes','number','','normal'),('hotelReviews','number','','normal'),
        ('hotelRating','number','','normal'),('hotelRank','number','','normal'),('startingPrice','number','','normal'),('warningStrikes','number','','normal'),('hotelStatus','enum','','normal'),('deletedAt','date','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'detailed_location','title':'detailedLocation (embedded)','x':120,'y':180,'w':430,'color':'#8a8a8a','fields':[
        ('city','enum','NN','embedded'),('district','string','','embedded'),('dong','string','','embedded'),('address','string','NN','embedded'),('coordinates.lat','number','NN','embedded'),('coordinates.lng','number','NN','embedded'),('nearestSubway','string','','embedded'),('subwayExit','string','','embedded'),('subwayLines[]','array','','embedded'),('walkingDistance','number','','embedded')
    ]},
    {'id':'flexible_checkin','title':'flexibleCheckIn (embedded)','x':120,'y':600,'w':360,'color':'#8a8a8a','fields':[
        ('enabled','bool','','embedded'),('times[]','array','','embedded'),('fee','number','','embedded')
    ]},
    {'id':'flexible_checkout','title':'flexibleCheckOut (embedded)','x':120,'y':860,'w':360,'color':'#8a8a8a','fields':[
        ('enabled','bool','','embedded'),('times[]','array','','embedded'),('fee','number','','embedded')
    ]},
    {'id':'verification_docs','title':'verificationDocs (embedded)','x':120,'y':1120,'w':420,'color':'#8a8a8a','fields':[
        ('businessLicense','string','','embedded'),('touristLicense','string','','embedded'),('propertyOwnership','string','','embedded')
    ]},
    {'id':'amenities','title':'amenities (embedded)','x':1520,'y':150,'w':480,'color':'#8a8a8a','fields':[
        ('workspace','bool','','embedded'),('wifi','bool','','embedded'),('wifiSpeed','number','','embedded'),('meetingRoom','bool','','embedded'),('coupleRoom','bool','','embedded'),('romanticView','bool','','embedded'),('privateBath','bool','','embedded'),('familyRoom','bool','','embedded'),('kidsFriendly','bool','','embedded'),('playground','bool','','embedded'),('pool','bool','','embedded'),('spa','bool','','embedded'),('roomService','bool','','embedded'),('restaurant','bool','','embedded'),('parking','bool','','embedded'),('parkingFee','number','','embedded'),('breakfast','bool','','embedded'),('breakfastIncluded','bool','','embedded'),('gym','bool','','embedded'),('airportShuttle','bool','','embedded'),('evCharging','bool','','embedded'),('wheelchairAccessible','bool','','embedded'),('elevator','bool','','embedded'),('accessibleBathroom','bool','','embedded'),('visualAlarms','bool','','embedded'),('serviceAnimalsAllowed','bool','','embedded')
    ]},
    {'id':'safety_features','title':'safetyFeatures (embedded)','x':1520,'y':920,'w':420,'color':'#8a8a8a','fields':[
        ('frontDesk24h','bool','','embedded'),('securityCameras','bool','','embedded'),('roomSafe','bool','','embedded'),('fireSafety','bool','','embedded'),('wellLitParking','bool','','embedded'),('femaleOnlyFloors','bool','','embedded')
    ]},
    {'id':'strike_history','title':'strikeHistory[] (embedded)','x':1520,'y':1220,'w':420,'color':'#8a8a8a','fields':[
        ('bookingId','objectId','','embedded'),('reason','string','','embedded'),('date','date','','embedded')
    ]},
    {'id':'rooms','title':'rooms','x':880,'y':1350,'w':420,'color':'#76c442','fields':[
        ('_id','objectId','PK','pk'),('hotelId','objectId','FK','fk'),('roomType','enum','NN','normal'),('roomNumber','string','','normal'),('roomName','string','NN','normal'),('roomDesc','string','','normal'),('maxOccupancy','number','NN','normal'),('bedType','enum','NN','normal'),('bedCount','number','NN','normal'),('basePrice','number','NN','normal'),('weekendSurcharge','number','','normal'),('roomSize','number','','normal'),('viewType','enum','','normal'),('roomAmenities[]','array','','embedded'),('totalRooms','number','NN','normal'),('availableRooms','number','NN','normal'),('currentViewers','number','','normal'),('roomImages[]','array','','embedded'),('roomStatus','enum','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'last_minute_deal','title':'lastMinuteDeal (embedded)','x':460,'y':1830,'w':380,'color':'#8a8a8a','fields':[
        ('isActive','bool','','embedded'),('discountPercent','number','','embedded'),('originalPrice','number','','embedded'),('dealPrice','number','','embedded'),('validUntil','date','','embedded')
    ]},
    {'id':'room_inventory','title':'roominventories','x':1360,'y':1760,'w':380,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('roomId','objectId','FK','fk'),('date','date','NN','normal'),('total','number','NN','normal'),('booked','number','','normal'),('closed','bool','','normal'),('basePrice','number','','normal'),('overridePrice','number','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'price_locks','title':'pricelocks','x':1820,'y':1760,'w':360,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('userId','objectId','FK','fk'),('roomId','objectId','FK','fk'),('lockedPrice','number','NN','normal'),('expiresAt','date','NN','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
],
rels=[
    {'from':'hotels','to':'detailed_location','from_card':'1','to_card':'1','label':'location','style':'dashed'},
    {'from':'hotels','to':'flexible_checkin','from_card':'1','to_card':'1','label':'checkin','style':'dashed'},
    {'from':'hotels','to':'flexible_checkout','from_card':'1','to_card':'1','label':'checkout','style':'dashed'},
    {'from':'hotels','to':'verification_docs','from_card':'1','to_card':'1','label':'verify','style':'dashed'},
    {'from':'hotels','to':'amenities','from_card':'1','to_card':'1','label':'amenities','style':'dashed'},
    {'from':'hotels','to':'safety_features','from_card':'1','to_card':'1','label':'safety','style':'dashed'},
    {'from':'hotels','to':'strike_history','from_card':'1','to_card':'N','label':'strikes','style':'dashed'},
    {'from':'hotels','to':'rooms','from_card':'1','to_card':'N','label':'rooms'},
    {'from':'rooms','to':'last_minute_deal','from_card':'1','to_card':'0..1','label':'deal','style':'dashed'},
    {'from':'rooms','to':'room_inventory','from_card':'1','to_card':'N','label':'inventory'},
    {'from':'rooms','to':'price_locks','from_card':'1','to_card':'N','label':'locks'},
],
notes=['All Hotel and Room schema fields are included','Embedded hotel structures are separated instead of collapsed','Price locks and room inventory are attached to the room domain']
))

# Page 3: Booking, review, chat
PAGES.append(dict(
filename='meomul-er-model-03-booking-chat.svg',
title='Meomul ER Model III',
subtitle='Booking, review and chat schemas with embedded arrays',
section='Page 3 · Booking, Review & Chat',
boxes=[
    {'id':'members','title':'members (context)','x':1080,'y':180,'w':360,'color':'#f4b400','fields':[
        ('_id','objectId','PK','pk'),('memberType','enum','NN','normal'),('memberNick','string','UK','normal'),('hostAccessStatus','enum','','normal')
    ]},
    {'id':'hotels','title':'hotels (context)','x':120,'y':250,'w':320,'color':'#76c442','fields':[
        ('_id','objectId','PK','pk'),('memberId','objectId','FK','fk'),('hotelTitle','string','NN','normal'),('hotelStatus','enum','','normal')
    ]},
    {'id':'rooms','title':'rooms (context)','x':120,'y':620,'w':320,'color':'#76c442','fields':[
        ('_id','objectId','PK','pk'),('hotelId','objectId','FK','fk'),('roomName','string','NN','normal'),('basePrice','number','NN','normal')
    ]},
    {'id':'bookings','title':'bookings','x':860,'y':420,'w':500,'color':'#76c442','fields':[
        ('_id','objectId','PK','pk'),('guestId','objectId','FK','fk'),('hotelId','objectId','FK','fk'),('checkInDate','date','NN','normal'),('checkOutDate','date','NN','normal'),('nights','number','NN','normal'),('adultCount','number','NN','normal'),('childCount','number','','normal'),('subtotal','number','NN','normal'),('weekendSurcharge','number','','normal'),('earlyCheckInFee','number','','normal'),('lateCheckOutFee','number','','normal'),('taxes','number','','normal'),('serviceFee','number','','normal'),('discount','number','','normal'),('totalPrice','number','NN','normal'),('paymentMethod','enum','NN','normal'),('paymentStatus','enum','','normal'),('paidAmount','number','','normal'),('paidAt','date','','normal'),('bookingStatus','enum','','normal'),('specialRequests','string','','normal'),('earlyCheckIn','bool','','normal'),('lateCheckOut','bool','','normal'),('cancellationDate','date','','normal'),('cancellationReason','string','','normal'),('cancellationFlow','enum','','normal'),('cancelledByMemberId','objectId','FK','fk'),('cancelledByMemberType','enum','','normal'),('refundAmount','number','','normal'),('refundDate','date','','normal'),('refundReason','string','','normal'),('refundEvidence[]','array','','embedded'),('ageVerified','bool','','normal'),('verificationMethod','string','','normal'),('bookingCode','string','UK','normal'),('qrCode','string','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'booking_rooms','title':'bookings.rooms[] (embedded)','x':120,'y':1070,'w':420,'color':'#8a8a8a','fields':[
        ('roomId','objectId','FK','fk'),('roomType','string','','embedded'),('quantity','number','NN','embedded'),('pricePerNight','number','NN','embedded'),('guestName','string','','embedded')
    ]},
    {'id':'reviews','title':'reviews','x':1580,'y':380,'w':420,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('reviewerId','objectId','FK','fk'),('hotelId','objectId','FK','fk'),('bookingId','objectId','FK','fk'),('verifiedStay','bool','','normal'),('stayDate','date','NN','normal'),('overallRating','number','NN','normal'),('cleanlinessRating','number','NN','normal'),('locationRating','number','NN','normal'),('valueRating','number','NN','normal'),('serviceRating','number','NN','normal'),('amenitiesRating','number','NN','normal'),('reviewTitle','string','','normal'),('reviewText','string','NN','normal'),('guestPhotos[]','array','','embedded'),('helpfulCount','number','','normal'),('reviewViews','number','','normal'),('reviewStatus','enum','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'hotel_response','title':'reviews.hotelResponse (embedded)','x':1580,'y':980,'w':420,'color':'#8a8a8a','fields':[
        ('responseText','string','','embedded'),('respondedBy','objectId','','embedded'),('respondedAt','date','','embedded')
    ]},
    {'id':'chats','title':'chats','x':860,'y':1320,'w':500,'color':'#f4b400','fields':[
        ('_id','objectId','PK','pk'),('guestId','objectId','FK','fk'),('hotelId','objectId','FK','fk'),('chatScope','enum','NN','normal'),('assignedAgentId','objectId','FK','fk'),('bookingId','objectId','FK','fk'),('supportTopic','string','','normal'),('sourcePath','string','','normal'),('chatStatus','enum','','normal'),('unreadGuestMessages','number','','normal'),('unreadAgentMessages','number','','normal'),('lastMessageAt','date','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'chat_messages','title':'chats.messages[] (embedded)','x':1580,'y':1320,'w':500,'color':'#8a8a8a','fields':[
        ('senderId','objectId','NN','embedded'),('senderType','enum','NN','embedded'),('messageType','enum','','embedded'),('content','string','','embedded'),('imageUrl','string','','embedded'),('fileUrl','string','','embedded'),('timestamp','date','','embedded'),('readByMemberIds[]','array','','embedded'),('read','bool','','embedded')
    ]},
],
rels=[
    {'from':'members','to':'bookings','from_card':'1','to_card':'N','label':'guest'},
    {'from':'hotels','to':'bookings','from_card':'1','to_card':'N','label':'hotel'},
    {'from':'rooms','to':'booking_rooms','from_card':'1','to_card':'N','label':'reserved'},
    {'from':'bookings','to':'booking_rooms','from_card':'1','to_card':'N','label':'rooms','style':'dashed'},
    {'from':'members','to':'reviews','from_card':'1','to_card':'N','label':'reviewer'},
    {'from':'hotels','to':'reviews','from_card':'1','to_card':'N','label':'hotel'},
    {'from':'bookings','to':'reviews','from_card':'1','to_card':'0..1','label':'review'},
    {'from':'reviews','to':'hotel_response','from_card':'1','to_card':'0..1','label':'response','style':'dashed'},
    {'from':'members','to':'chats','from_card':'1','to_card':'N','label':'guest'},
    {'from':'hotels','to':'chats','from_card':'1','to_card':'N','label':'hotel'},
    {'from':'bookings','to':'chats','from_card':'1','to_card':'0..N','label':'context'},
    {'from':'members','to':'chats','from_card':'1','to_card':'0..N','label':'agent','from_side':'right','to_side':'top','style':'dashed'},
    {'from':'chats','to':'chat_messages','from_card':'1','to_card':'N','label':'messages','style':'dashed'},
],
notes=['All Booking, Review and Chat schema fields are included','Embedded booking room rows and chat message rows are expanded as separate cards','Dashed Member→Chat relation denotes assignedAgentId role in addition to guestId']
))

# Page 4: Engagement and recommendation
PAGES.append(dict(
filename='meomul-er-model-04-engagement-recommendation.svg',
title='Meomul ER Model IV',
subtitle='Likes, views, search history, user profile and recommendation cache',
section='Page 4 · Engagement & Recommendation',
boxes=[
    {'id':'members','title':'members (context)','x':1000,'y':260,'w':360,'color':'#f4b400','fields':[
        ('_id','objectId','PK','pk'),('memberType','enum','NN','normal'),('memberNick','string','UK','normal'),('memberRank','number','','normal')
    ]},
    {'id':'hotels','title':'hotels (context)','x':120,'y':280,'w':320,'color':'#76c442','fields':[
        ('_id','objectId','PK','pk'),('hotelTitle','string','NN','normal'),('hotelLocation','enum','','normal'),('hotelType','enum','','normal')
    ]},
    {'id':'likes','title':'likes','x':520,'y':220,'w':340,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('likeGroup','enum','NN','normal'),('likeRefId','objectId','NN','normal'),('memberId','objectId','FK','fk'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'views','title':'views','x':520,'y':620,'w':340,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('viewGroup','enum','NN','normal'),('viewRefId','objectId','NN','normal'),('memberId','objectId','FK','fk'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'search_history','title':'searchhistories','x':940,'y':860,'w':420,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('memberId','objectId','FK','fk'),('location','enum','','normal'),('hotelTypes[]','array','','embedded'),('priceMin','number','','normal'),('priceMax','number','','normal'),('purpose','enum','','normal'),('amenities[]','array','','embedded'),('starRatings[]','array','','embedded'),('guestCount','number','','normal'),('text','string','','normal'),('fingerprint','string','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'user_profile','title':'userprofiles','x':1520,'y':860,'w':420,'color':'#f4b400','fields':[
        ('_id','objectId','PK','pk'),('memberId','objectId','FK','fk'),('preferredLocations[]','array','','embedded'),('preferredTypes[]','array','','embedded'),('preferredPurposes[]','array','','embedded'),('preferredAmenities[]','array','','embedded'),('avgPriceMin','number','','normal'),('avgPriceMax','number','','normal'),('viewedHotelIds[]','array','','embedded'),('likedHotelIds[]','array','','embedded'),('bookedHotelIds[]','array','','embedded'),('source','enum','','normal'),('computedAt','date','NN','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'recommendation_cache','title':'recommendationcaches','x':1520,'y':1450,'w':420,'color':'#8a8a8a','fields':[
        ('_id','objectId','PK','pk'),('cacheKey','string','UK','normal'),('data','mixed','NN','normal'),('computedAt','date','NN','normal'),('expiresAt','date','NN','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
],
rels=[
    {'from':'members','to':'likes','from_card':'1','to_card':'N','label':'likes'},
    {'from':'members','to':'views','from_card':'1','to_card':'N','label':'views'},
    {'from':'likes','to':'hotels','from_card':'N*','to_card':'N*','label':'target','style':'dashed'},
    {'from':'views','to':'hotels','from_card':'N*','to_card':'N*','label':'target','style':'dashed'},
    {'from':'members','to':'search_history','from_card':'1','to_card':'N','label':'searches'},
    {'from':'members','to':'user_profile','from_card':'1','to_card':'1','label':'profile'},
    {'from':'user_profile','to':'hotels','from_card':'N*','to_card':'N*','label':'refs','style':'dashed'},
    {'from':'likes','to':'recommendation_cache','from_card':'N','to_card':'N','label':'signal','style':'dashed'},
    {'from':'views','to':'recommendation_cache','from_card':'N','to_card':'N','label':'signal','style':'dashed'},
    {'from':'search_history','to':'recommendation_cache','from_card':'N','to_card':'N','label':'signal','style':'dashed'},
    {'from':'user_profile','to':'recommendation_cache','from_card':'1','to_card':'N','label':'feeds','style':'dashed'},
],
notes=['All engagement and recommendation schema fields are included','Like/View target ids are polymorphic so relation is shown as dashed context link','UserProfile keeps both onboarding preferences and computed hotel id arrays']
))

# Master page: everything in one file
PAGES.append(dict(
filename='meomul-er-model-master.svg',
title='Meomul Complete ER Model',
subtitle='Single-canvas schema-level map of all backend persistence models and embedded structures',
section='Master Page · Full Backend Schema',
width=3300,
height=2750,
groups=[
    {'title':'Identity & Access','subtitle':'member account, auth state and host approval', 'x':40, 'y':205, 'w':1040, 'h':470, 'fill':'#3a444f', 'stroke':'#5f7081'},
    {'title':'Signals & Personalization','subtitle':'likes, views, search history and recommendation state', 'x':40, 'y':700, 'w':1040, 'h':1600, 'fill':'#334047', 'stroke':'#56717c'},
    {'title':'Hospitality Core','subtitle':'hotel, room and booking aggregates', 'x':1100, 'y':205, 'w':560, 'h':2235, 'fill':'#384337', 'stroke':'#69865f'},
    {'title':'Hotel Value Objects','subtitle':'embedded policy, location, amenity and safety structures', 'x':1625, 'y':205, 'w':1015, 'h':1310, 'fill':'#403f45', 'stroke':'#6b6973'},
    {'title':'Stay Operations & Conversation','subtitle':'inventory, locks, reviews and chats', 'x':1625, 'y':1540, 'w':1415, 'h':990, 'fill':'#403a36', 'stroke':'#786b5f'},
],
boxes=[
    {'id':'members','title':'members','x':80,'y':220,'w':420,'color':'#f4b400','fields':[
        ('_id','objectId','PK','pk'),('memberType','enum','NN','normal'),('memberStatus','enum','NN','normal'),('hostAccessStatus','enum','NN','normal'),
        ('memberAuthType','enum','NN','normal'),('memberPhone','string','UK','normal'),('memberNick','string','UK','normal'),('memberPassword','string','NN','normal'),
        ('memberFullName','string','','normal'),('memberImage','string','','normal'),('memberAddress','string','','normal'),('memberDesc','string','','normal'),
        ('subscriptionTier','enum','','normal'),('subscriptionExpiry','date','','normal'),('memberPoints','number','','normal'),('memberBadges[]','array','','embedded'),
        ('memberProperties','number','','normal'),('memberArticles','number','','normal'),('memberFollowers','number','','normal'),('memberFollowings','number','','normal'),
        ('memberViews','number','','normal'),('memberLikes','number','','normal'),('memberComments','number','','normal'),('memberRank','number','','normal'),
        ('deletedAt','date','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'refresh_tokens','title':'refreshTokens','x':80,'y':980,'w':360,'color':'#8a8a8a','fields':[
        ('_id','objectId','PK','pk'),('tokenHash','string','UK','normal'),('memberId','objectId','FK','fk'),('expiresAt','date','NN','normal'),('revoked','bool','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'notifications','title':'notifications','x':80,'y':1280,'w':380,'color':'#8a8a8a','fields':[
        ('_id','objectId','PK','pk'),('userId','objectId','FK','fk'),('type','enum','NN','normal'),('title','string','NN','normal'),('message','string','NN','normal'),('link','string','','normal'),('read','bool','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'follows','title':'follows','x':80,'y':1660,'w':360,'color':'#ff4747','fields':[
        ('_id','objectId','PK','pk'),('followerId','objectId','FK','fk'),('followingId','objectId','FK','fk'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'analytics_events','title':'analytics_events','x':80,'y':1960,'w':400,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('memberId','objectId','FK','fk'),('memberType','enum','NN','normal'),('eventName','string','NN','normal'),('eventPath','string','','normal'),('payload','string','','normal'),('source','string','','normal'),('userAgent','string','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},

    {'id':'host_applications','title':'host_applications','x':620,'y':220,'w':420,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('applicantMemberId','objectId','FK','fk'),('businessName','string','NN','normal'),('businessDescription','string','NN','normal'),
        ('contactPhone','string','','normal'),('businessEmail','string','','normal'),('intendedHotelName','string','','normal'),('intendedHotelLocation','enum','','normal'),
        ('hotelType','enum','NN','normal'),('suitableFor[]','array','','embedded'),('notes','string','','normal'),('status','enum','NN','normal'),
        ('reviewedByMemberId','objectId','FK','fk'),('reviewNote','string','','normal'),('reviewedAt','date','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'likes','title':'likes','x':620,'y':760,'w':340,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('likeGroup','enum','NN','normal'),('likeRefId','objectId','NN','normal'),('memberId','objectId','FK','fk'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'views','title':'views','x':620,'y':1060,'w':340,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('viewGroup','enum','NN','normal'),('viewRefId','objectId','NN','normal'),('memberId','objectId','FK','fk'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'search_history','title':'searchhistories','x':620,'y':1360,'w':420,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('memberId','objectId','FK','fk'),('location','enum','','normal'),('hotelTypes[]','array','','embedded'),('priceMin','number','','normal'),('priceMax','number','','normal'),('purpose','enum','','normal'),('amenities[]','array','','embedded'),('starRatings[]','array','','embedded'),('guestCount','number','','normal'),('text','string','','normal'),('fingerprint','string','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'user_profile','title':'userprofiles','x':620,'y':1810,'w':420,'color':'#f4b400','fields':[
        ('_id','objectId','PK','pk'),('memberId','objectId','FK','fk'),('preferredLocations[]','array','','embedded'),('preferredTypes[]','array','','embedded'),('preferredPurposes[]','array','','embedded'),('preferredAmenities[]','array','','embedded'),('avgPriceMin','number','','normal'),('avgPriceMax','number','','normal'),('viewedHotelIds[]','array','','embedded'),('likedHotelIds[]','array','','embedded'),('bookedHotelIds[]','array','','embedded'),('source','enum','','normal'),('computedAt','date','NN','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'recommendation_cache','title':'recommendationcaches','x':620,'y':2290,'w':420,'color':'#8a8a8a','fields':[
        ('_id','objectId','PK','pk'),('cacheKey','string','UK','normal'),('data','mixed','NN','normal'),('computedAt','date','NN','normal'),('expiresAt','date','NN','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},

    {'id':'hotels','title':'hotels','x':1140,'y':220,'w':460,'color':'#76c442','fields':[
        ('_id','objectId','PK','pk'),('memberId','objectId','FK','fk'),('hotelType','enum','NN','normal'),('hotelTitle','string','NN','normal'),('hotelDesc','string','','normal'),('hotelLocation','enum','NN','normal'),
        ('starRating','number','','normal'),('checkInTime','string','','normal'),('checkOutTime','string','','normal'),('verificationStatus','enum','','normal'),('badgeLevel','enum','','normal'),('lastInspectionDate','date','','normal'),
        ('cancellationPolicy','enum','','normal'),('ageRestriction','number','','normal'),('petsAllowed','bool','','normal'),('maxPetWeight','number','','normal'),('smokingAllowed','bool','','normal'),('safeStayCertified','bool','','normal'),
        ('suitableFor[]','array','','embedded'),('hotelImages[]','array','','embedded'),('hotelVideos[]','array','','embedded'),('hotelViews','number','','normal'),('hotelLikes','number','','normal'),('hotelReviews','number','','normal'),
        ('hotelRating','number','','normal'),('hotelRank','number','','normal'),('startingPrice','number','','normal'),('warningStrikes','number','','normal'),('hotelStatus','enum','','normal'),('deletedAt','date','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'rooms','title':'rooms','x':1140,'y':1120,'w':420,'color':'#76c442','fields':[
        ('_id','objectId','PK','pk'),('hotelId','objectId','FK','fk'),('roomType','enum','NN','normal'),('roomNumber','string','','normal'),('roomName','string','NN','normal'),('roomDesc','string','','normal'),('maxOccupancy','number','NN','normal'),('bedType','enum','NN','normal'),('bedCount','number','NN','normal'),('basePrice','number','NN','normal'),('weekendSurcharge','number','','normal'),('roomSize','number','','normal'),('viewType','enum','','normal'),('roomAmenities[]','array','','embedded'),('totalRooms','number','NN','normal'),('availableRooms','number','NN','normal'),('currentViewers','number','','normal'),('roomImages[]','array','','embedded'),('roomStatus','enum','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'bookings','title':'bookings','x':1140,'y':1740,'w':500,'color':'#76c442','fields':[
        ('_id','objectId','PK','pk'),('guestId','objectId','FK','fk'),('hotelId','objectId','FK','fk'),('checkInDate','date','NN','normal'),('checkOutDate','date','NN','normal'),('nights','number','NN','normal'),('adultCount','number','NN','normal'),('childCount','number','','normal'),('subtotal','number','NN','normal'),('weekendSurcharge','number','','normal'),('earlyCheckInFee','number','','normal'),('lateCheckOutFee','number','','normal'),('taxes','number','','normal'),('serviceFee','number','','normal'),('discount','number','','normal'),('totalPrice','number','NN','normal'),('paymentMethod','enum','NN','normal'),('paymentStatus','enum','','normal'),('paidAmount','number','','normal'),('paidAt','date','','normal'),('bookingStatus','enum','','normal'),('specialRequests','string','','normal'),('earlyCheckIn','bool','','normal'),('lateCheckOut','bool','','normal'),('cancellationDate','date','','normal'),('cancellationReason','string','','normal'),('cancellationFlow','enum','','normal'),('cancelledByMemberId','objectId','FK','fk'),('cancelledByMemberType','enum','','normal'),('refundAmount','number','','normal'),('refundDate','date','','normal'),('refundReason','string','','normal'),('refundEvidence[]','array','','embedded'),('ageVerified','bool','','normal'),('verificationMethod','string','','normal'),('bookingCode','string','UK','normal'),('qrCode','string','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},

    {'id':'detailed_location','title':'detailedLocation','x':1660,'y':220,'w':430,'color':'#8a8a8a','fields':[
        ('city','enum','NN','embedded'),('district','string','','embedded'),('dong','string','','embedded'),('address','string','NN','embedded'),('coordinates.lat','number','NN','embedded'),('coordinates.lng','number','NN','embedded'),('nearestSubway','string','','embedded'),('subwayExit','string','','embedded'),('subwayLines[]','array','','embedded'),('walkingDistance','number','','embedded')
    ]},
    {'id':'flexible_checkin','title':'flexibleCheckIn','x':1660,'y':540,'w':360,'color':'#8a8a8a','fields':[
        ('enabled','bool','','embedded'),('times[]','array','','embedded'),('fee','number','','embedded')
    ]},
    {'id':'flexible_checkout','title':'flexibleCheckOut','x':1660,'y':760,'w':360,'color':'#8a8a8a','fields':[
        ('enabled','bool','','embedded'),('times[]','array','','embedded'),('fee','number','','embedded')
    ]},
    {'id':'verification_docs','title':'verificationDocs','x':1660,'y':980,'w':420,'color':'#8a8a8a','fields':[
        ('businessLicense','string','','embedded'),('touristLicense','string','','embedded'),('propertyOwnership','string','','embedded')
    ]},
    {'id':'amenities','title':'amenities','x':2100,'y':220,'w':480,'color':'#8a8a8a','fields':[
        ('workspace','bool','','embedded'),('wifi','bool','','embedded'),('wifiSpeed','number','','embedded'),('meetingRoom','bool','','embedded'),('coupleRoom','bool','','embedded'),('romanticView','bool','','embedded'),('privateBath','bool','','embedded'),('familyRoom','bool','','embedded'),('kidsFriendly','bool','','embedded'),('playground','bool','','embedded'),('pool','bool','','embedded'),('spa','bool','','embedded'),('roomService','bool','','embedded'),('restaurant','bool','','embedded'),('parking','bool','','embedded'),('parkingFee','number','','embedded'),('breakfast','bool','','embedded'),('breakfastIncluded','bool','','embedded'),('gym','bool','','embedded'),('airportShuttle','bool','','embedded'),('evCharging','bool','','embedded'),('wheelchairAccessible','bool','','embedded'),('elevator','bool','','embedded'),('accessibleBathroom','bool','','embedded'),('visualAlarms','bool','','embedded'),('serviceAnimalsAllowed','bool','','embedded')
    ]},
    {'id':'safety_features','title':'safetyFeatures','x':2100,'y':940,'w':420,'color':'#8a8a8a','fields':[
        ('frontDesk24h','bool','','embedded'),('securityCameras','bool','','embedded'),('roomSafe','bool','','embedded'),('fireSafety','bool','','embedded'),('wellLitParking','bool','','embedded'),('femaleOnlyFloors','bool','','embedded')
    ]},
    {'id':'strike_history','title':'strikeHistory[]','x':2100,'y':1220,'w':420,'color':'#8a8a8a','fields':[
        ('bookingId','objectId','','embedded'),('reason','string','','embedded'),('date','date','','embedded')
    ]},
    {'id':'last_minute_deal','title':'lastMinuteDeal','x':1660,'y':1320,'w':380,'color':'#8a8a8a','fields':[
        ('isActive','bool','','embedded'),('discountPercent','number','','embedded'),('originalPrice','number','','embedded'),('dealPrice','number','','embedded'),('validUntil','date','','embedded')
    ]},
    {'id':'room_inventory','title':'roominventories','x':2100,'y':1560,'w':380,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('roomId','objectId','FK','fk'),('date','date','NN','normal'),('total','number','NN','normal'),('booked','number','','normal'),('closed','bool','','normal'),('basePrice','number','','normal'),('overridePrice','number','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'price_locks','title':'pricelocks','x':2520,'y':1560,'w':360,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('userId','objectId','FK','fk'),('roomId','objectId','FK','fk'),('lockedPrice','number','NN','normal'),('expiresAt','date','NN','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'booking_rooms','title':'bookings.rooms[]','x':1660,'y':1880,'w':420,'color':'#8a8a8a','fields':[
        ('roomId','objectId','FK','fk'),('roomType','string','','embedded'),('quantity','number','NN','embedded'),('pricePerNight','number','NN','embedded'),('guestName','string','','embedded')
    ]},
    {'id':'reviews','title':'reviews','x':2100,'y':1880,'w':420,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('reviewerId','objectId','FK','fk'),('hotelId','objectId','FK','fk'),('bookingId','objectId','FK','fk'),('verifiedStay','bool','','normal'),('stayDate','date','NN','normal'),('overallRating','number','NN','normal'),('cleanlinessRating','number','NN','normal'),('locationRating','number','NN','normal'),('valueRating','number','NN','normal'),('serviceRating','number','NN','normal'),('amenitiesRating','number','NN','normal'),('reviewTitle','string','','normal'),('reviewText','string','NN','normal'),('guestPhotos[]','array','','embedded'),('helpfulCount','number','','normal'),('reviewViews','number','','normal'),('reviewStatus','enum','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'hotel_response','title':'reviews.hotelResponse','x':2540,'y':2180,'w':380,'color':'#8a8a8a','fields':[
        ('responseText','string','','embedded'),('respondedBy','objectId','','embedded'),('respondedAt','date','','embedded')
    ]},
    {'id':'chats','title':'chats','x':2520,'y':980,'w':500,'color':'#f4b400','fields':[
        ('_id','objectId','PK','pk'),('guestId','objectId','FK','fk'),('hotelId','objectId','FK','fk'),('chatScope','enum','NN','normal'),('assignedAgentId','objectId','FK','fk'),('bookingId','objectId','FK','fk'),('supportTopic','string','','normal'),('sourcePath','string','','normal'),('chatStatus','enum','','normal'),('unreadGuestMessages','number','','normal'),('unreadAgentMessages','number','','normal'),('lastMessageAt','date','','normal'),('createdAt','date','','normal'),('updatedAt','date','','normal')
    ]},
    {'id':'chat_messages','title':'chats.messages[]','x':2520,'y':1320,'w':500,'color':'#8a8a8a','fields':[
        ('senderId','objectId','NN','embedded'),('senderType','enum','NN','embedded'),('messageType','enum','','embedded'),('content','string','','embedded'),('imageUrl','string','','embedded'),('fileUrl','string','','embedded'),('timestamp','date','','embedded'),('readByMemberIds[]','array','','embedded'),('read','bool','','embedded')
    ]},
],
rels=[
    {'from':'members','to':'host_applications','from_card':'1','to_card':'N','label':'applies'},
    {'from':'members','to':'host_applications','from_card':'1','to_card':'0..N','label':'reviews','from_side':'right','to_side':'top','style':'dashed'},
    {'from':'members','to':'notifications','from_card':'1','to_card':'N','label':'receives'},
    {'from':'members','to':'follows','from_card':'1','to_card':'N','label':'follower'},
    {'from':'members','to':'follows','from_card':'1','to_card':'N','label':'following','from_side':'right','to_side':'top','style':'dashed'},
    {'from':'members','to':'refresh_tokens','from_card':'1','to_card':'N','label':'auth'},
    {'from':'members','to':'analytics_events','from_card':'1','to_card':'N','label':'events'},
    {'from':'members','to':'likes','from_card':'1','to_card':'N','label':'likes'},
    {'from':'members','to':'views','from_card':'1','to_card':'N','label':'views'},
    {'from':'likes','to':'hotels','from_card':'N*','to_card':'N*','label':'target','style':'dashed'},
    {'from':'views','to':'hotels','from_card':'N*','to_card':'N*','label':'target','style':'dashed'},
    {'from':'members','to':'search_history','from_card':'1','to_card':'N','label':'searches'},
    {'from':'members','to':'user_profile','from_card':'1','to_card':'1','label':'profile'},
    {'from':'user_profile','to':'hotels','from_card':'N*','to_card':'N*','label':'refs','style':'dashed'},
    {'from':'likes','to':'recommendation_cache','from_card':'N','to_card':'N','label':'signal','style':'dashed'},
    {'from':'views','to':'recommendation_cache','from_card':'N','to_card':'N','label':'signal','style':'dashed'},
    {'from':'search_history','to':'recommendation_cache','from_card':'N','to_card':'N','label':'signal','style':'dashed'},
    {'from':'user_profile','to':'recommendation_cache','from_card':'1','to_card':'N','label':'feeds','style':'dashed'},
    {'from':'members','to':'hotels','from_card':'1','to_card':'N','label':'owns'},
    {'from':'hotels','to':'detailed_location','from_card':'1','to_card':'1','label':'location','style':'dashed'},
    {'from':'hotels','to':'flexible_checkin','from_card':'1','to_card':'1','label':'checkin','style':'dashed'},
    {'from':'hotels','to':'flexible_checkout','from_card':'1','to_card':'1','label':'checkout','style':'dashed'},
    {'from':'hotels','to':'verification_docs','from_card':'1','to_card':'1','label':'verify','style':'dashed'},
    {'from':'hotels','to':'amenities','from_card':'1','to_card':'1','label':'amenities','style':'dashed'},
    {'from':'hotels','to':'safety_features','from_card':'1','to_card':'1','label':'safety','style':'dashed'},
    {'from':'hotels','to':'strike_history','from_card':'1','to_card':'N','label':'strikes','style':'dashed'},
    {'from':'hotels','to':'rooms','from_card':'1','to_card':'N','label':'rooms'},
    {'from':'rooms','to':'last_minute_deal','from_card':'1','to_card':'0..1','label':'deal','style':'dashed'},
    {'from':'rooms','to':'room_inventory','from_card':'1','to_card':'N','label':'inventory'},
    {'from':'members','to':'price_locks','from_card':'1','to_card':'N','label':'lock'},
    {'from':'rooms','to':'price_locks','from_card':'1','to_card':'N','label':'locks'},
    {'from':'members','to':'bookings','from_card':'1','to_card':'N','label':'guest'},
    {'from':'hotels','to':'bookings','from_card':'1','to_card':'N','label':'hotel'},
    {'from':'bookings','to':'booking_rooms','from_card':'1','to_card':'N','label':'rooms','style':'dashed'},
    {'from':'rooms','to':'booking_rooms','from_card':'1','to_card':'N','label':'reserved'},
    {'from':'members','to':'reviews','from_card':'1','to_card':'N','label':'reviewer'},
    {'from':'hotels','to':'reviews','from_card':'1','to_card':'N','label':'hotel'},
    {'from':'bookings','to':'reviews','from_card':'1','to_card':'0..1','label':'review'},
    {'from':'reviews','to':'hotel_response','from_card':'1','to_card':'0..1','label':'response','style':'dashed'},
    {'from':'members','to':'chats','from_card':'1','to_card':'N','label':'guest'},
    {'from':'members','to':'chats','from_card':'1','to_card':'0..N','label':'agent','from_side':'right','to_side':'top','style':'dashed'},
    {'from':'hotels','to':'chats','from_card':'1','to_card':'N','label':'hotel'},
    {'from':'bookings','to':'chats','from_card':'1','to_card':'0..N','label':'context'},
    {'from':'chats','to':'chat_messages','from_card':'1','to_card':'N','label':'messages','style':'dashed'},
],
notes=['Single-canvas master file with all schema-level entities and embedded structures','Nothing was reduced away; readability is traded for completeness','Dashed links mark embedded, polymorphic or secondary-role relations']
))

for page in PAGES:
    out = render(**page)
    print(out)
