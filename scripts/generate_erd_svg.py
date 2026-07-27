from pathlib import Path
from xml.sax.saxutils import escape

OUT_DIR = Path('/Users/kamil/Desktop/Meomul/docs/assets')
OUT_DIR.mkdir(parents=True, exist_ok=True)

CANVAS_W = 2400
CANVAS_H = 2350
TITLE_H = 170
BODY_Y = 190

BASE_STYLE = '''
<defs>
  <linearGradient id="titleGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffffff"/>
    <stop offset="100%" stop-color="#edf3fa"/>
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
    .title { font: 300 76px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; fill: #4a88ca; }
    .subtitle { font: 500 18px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; fill: #8ea8c4; }
    .section { font: 700 20px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; fill: #d2d2d2; }
    .box-title { font: 700 22px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; fill: #ffffff; }
    .field { font: 500 15px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; fill: #efefef; }
    .type { font: italic 600 14px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; fill: #b9b9b9; }
    .flag { font: 700 13px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; fill: #cfcfcf; }
    .link { stroke: #cbcbcb; stroke-width: 2.6; fill: none; opacity: .95; }
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


def box_height(field_count):
    return 44 + 24 + field_count * 26 + 18


def sides_for(a, b):
    ax = a['x'] + a['w'] / 2
    ay = a['y'] + a['h'] / 2
    bx = b['x'] + b['w'] / 2
    by = b['y'] + b['h'] / 2
    dx = bx - ax
    dy = by - ay
    if abs(dx) >= abs(dy):
        return ('right', 'left') if dx > 0 else ('left', 'right')
    return ('bottom', 'top') if dy > 0 else ('top', 'bottom')


def anchor(box, side):
    if side == 'left':
        return box['x'], box['y'] + box['h'] / 2
    if side == 'right':
        return box['x'] + box['w'], box['y'] + box['h'] / 2
    if side == 'top':
        return box['x'] + box['w'] / 2, box['y']
    return box['x'] + box['w'] / 2, box['y'] + box['h']


def curve_points(a, sa, b, sb):
    x1, y1 = anchor(a, sa)
    x2, y2 = anchor(b, sb)
    offset_x = 170
    offset_y = 130
    if sa in ('left', 'right'):
        c1 = (x1 + (offset_x if sa == 'right' else -offset_x), y1)
    else:
        c1 = (x1, y1 + (offset_y if sa == 'bottom' else -offset_y))
    if sb in ('left', 'right'):
        c2 = (x2 + (-offset_x if sb == 'left' else offset_x), y2)
    else:
        c2 = (x2, y2 + (-offset_y if sb == 'top' else offset_y))
    return (x1, y1), c1, c2, (x2, y2)


def draw_box(parts, b):
    x, y, w, h = b['x'], b['y'], b['w'], b['h']
    parts.append('<g filter="url(#shadow)">')
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" class="card"/>')
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="36" fill="{b["color"]}"/>')
    parts.append(f'<text x="{x + w/2}" y="{y + 24}" text-anchor="middle" class="box-title">{escape(b["title"])}</text>')
    row_y = y + 54
    for idx, (fname, ftype, flag, kind) in enumerate(b['fields']):
        yy = row_y + idx * 26
        if kind == 'pk':
            icon = '<rect x="0" y="0" width="10" height="10" rx="2" class="pk"/>'
        elif kind == 'fk':
            icon = '<rect x="0" y="0" width="10" height="10" rx="2" class="fk"/>'
        elif kind == 'embedded':
            icon = '<circle cx="5" cy="5" r="4.2" class="emb"/>'
        else:
            icon = '<circle cx="5" cy="5" r="3.2" fill="#7a7a7a"/>'
        parts.append(f'<g transform="translate({x + 16},{yy - 10})">{icon}</g>')
        parts.append(f'<text x="{x + 32}" y="{yy}" class="field">{escape(fname)}</text>')
        parts.append(f'<text x="{x + w - 112}" y="{yy}" class="type">{escape(ftype)}</text>')
        parts.append(f'<text x="{x + w - 18}" y="{yy}" text-anchor="end" class="flag">{escape(flag)}</text>')
    parts.append('</g>')


def draw_relation(parts, box_map, r):
    a = box_map[r['from']]
    b = box_map[r['to']]
    sa = r.get('from_side')
    sb = r.get('to_side')
    if not sa or not sb:
        sa, sb = sides_for(a, b)
    p1, c1, c2, p2 = curve_points(a, sa, b, sb)
    klass = 'link-dashed' if r.get('style') == 'dashed' else 'link'
    marker = '' if r.get('style') == 'dashed' else ' marker-end="url(#arrow)"'
    parts.append(f'<path class="{klass}" d="M{p1[0]},{p1[1]} C{c1[0]},{c1[1]} {c2[0]},{c2[1]} {p2[0]},{p2[1]}"{marker}/>')
    mx = (p1[0] + p2[0] + c1[0] + c2[0]) / 4
    my = (p1[1] + p2[1] + c1[1] + c2[1]) / 4
    parts.append(f'<circle cx="{mx}" cy="{my}" r="11" fill="#343434" stroke="#c8c8c8" stroke-width="2"/>')
    parts.append(f'<text x="{mx}" y="{my+4}" text-anchor="middle" class="rel-label">{escape(r["label"][:1].upper())}</text>')
    parts.append(f'<text x="{p1[0]}" y="{p1[1]-9}" text-anchor="middle" class="end-label">{escape(r["from_card"])}</text>')
    parts.append(f'<text x="{p2[0]}" y="{p2[1]-9}" text-anchor="middle" class="end-label">{escape(r["to_card"])}</text>')


def render_page(filename, title, subtitle, section_label, boxes, relations, notes):
    for b in boxes:
        b['h'] = box_height(len(b['fields']))
    box_map = {b['id']: b for b in boxes}
    parts = []
    ap = parts.append
    ap(f'<svg xmlns="http://www.w3.org/2000/svg" width="{CANVAS_W}" height="{CANVAS_H}" viewBox="0 0 {CANVAS_W} {CANVAS_H}">')
    ap(BASE_STYLE)
    ap(f'<rect x="0" y="0" width="{CANVAS_W}" height="{CANVAS_H}" fill="#245f68"/>')
    ap(f'<rect x="8" y="14" width="{CANVAS_W-16}" height="{CANVAS_H-22}" rx="18" fill="#ffffff" filter="url(#softShadow)"/>')
    ap(f'<rect x="8" y="14" width="{CANVAS_W-16}" height="{TITLE_H}" rx="18" fill="url(#titleGrad)"/>')
    ap(f'<rect x="8" y="{BODY_Y}" width="{CANVAS_W-16}" height="{CANVAS_H-BODY_Y-8}" fill="#343434"/>')
    ap(f'<text x="{CANVAS_W/2}" y="92" text-anchor="middle" class="title">{escape(title)}</text>')
    ap(f'<text x="{CANVAS_W/2}" y="130" text-anchor="middle" class="subtitle">{escape(subtitle)}</text>')
    ap(f'<text x="64" y="230" class="section">{escape(section_label)}</text>')

    for r in relations:
        draw_relation(parts, box_map, r)
    for b in boxes:
        draw_box(parts, b)

    legend_y = CANVAS_H - 90
    ap(f'<text x="64" y="{legend_y}" class="legend">Legend:</text>')
    ap(f'<rect x="130" y="{legend_y-12}" width="10" height="10" rx="2" class="pk"/>')
    ap(f'<text x="150" y="{legend_y}" class="legend">PK</text>')
    ap(f'<rect x="205" y="{legend_y-12}" width="10" height="10" rx="2" class="fk"/>')
    ap(f'<text x="225" y="{legend_y}" class="legend">FK</text>')
    ap(f'<circle cx="315" cy="{legend_y-7}" r="4.2" class="emb"/>')
    ap(f'<text x="330" y="{legend_y}" class="legend">embedded / value object</text>')
    ap(f'<path d="M560,{legend_y-7} C610,{legend_y-7} 640,{legend_y-7} 690,{legend_y-7}" class="link-dashed"/>')
    ap(f'<text x="710" y="{legend_y}" class="legend">derived or polymorphic relation</text>')

    ny = CANVAS_H - 52
    x = 64
    for note in notes:
        ap(f'<text x="{x}" y="{ny}" class="legend">• {escape(note)}</text>')
        x += 560

    ap('</svg>')
    out = OUT_DIR / filename
    out.write_text(''.join(parts), encoding='utf-8')
    return out


page1_boxes = [
    {'id':'members','title':'members','x':1020,'y':230,'w':360,'color':'#f4b400','fields':[
        ('_id','objectId','PK','pk'),('memberType','enum','NN','normal'),('memberStatus','enum','NN','normal'),
        ('hostAccessStatus','enum','NN','normal'),('memberPhone','string','UK','normal'),('memberNick','string','UK','normal'),
        ('subscriptionTier','enum','','normal'),('memberRank','int','','normal'),('createdAt','date','','normal')
    ]},
    {'id':'host_apps','title':'host_applications','x':1870,'y':190,'w':380,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('applicantMemberId','objectId','FK','fk'),('reviewedByMemberId','objectId','FK','fk'),
        ('businessName','string','NN','normal'),('businessEmail','string','','normal'),('intendedHotelName','string','','normal'),
        ('intendedHotelLocation','enum','','normal'),('hotelType','enum','NN','normal'),('status','enum','NN','normal'),('reviewedAt','date','','normal')
    ]},
    {'id':'hotels','title':'hotels','x':740,'y':540,'w':420,'color':'#76c442','fields':[
        ('_id','objectId','PK','pk'),('memberId','objectId','FK','fk'),('hotelType','enum','NN','normal'),('hotelTitle','string','NN','normal'),
        ('hotelDesc','string','','normal'),('hotelLocation','enum','NN','normal'),('hotelStatus','enum','NN','normal'),('verificationStatus','enum','','normal'),
        ('badgeLevel','enum','','normal'),('starRating','number','','normal'),('hotelRating','number','','normal'),('startingPrice','number','','normal'),
        ('hotelViews','int','','normal'),('hotelLikes','int','','normal'),('hotelReviews','int','','normal'),('hotelRank','number','','normal'),
        ('warningStrikes','int','','normal'),('safeStayCertified','bool','','normal')
    ]},
    {'id':'hotel_location','title':'detailed_location (embedded)','x':120,'y':260,'w':420,'color':'#8a8a8a','fields':[
        ('city','enum','NN','embedded'),('district','string','','embedded'),('dong','string','','embedded'),
        ('address','string','NN','embedded'),('coordinates.lat','number','NN','embedded'),('coordinates.lng','number','NN','embedded'),
        ('nearestSubway','string','','embedded'),('subwayExit','string','','embedded'),('subwayLines[]','array','','embedded'),('walkingDistance','number','','embedded')
    ]},
    {'id':'hotel_policy','title':'hotel_policy (embedded)','x':120,'y':620,'w':420,'color':'#8a8a8a','fields':[
        ('checkInTime','time','','embedded'),('checkOutTime','time','','embedded'),('cancellationPolicy','enum','','embedded'),
        ('ageRestriction','int','','embedded'),('petsAllowed','bool','','embedded'),('maxPetWeight','number','','embedded'),
        ('smokingAllowed','bool','','embedded'),('suitableFor[]','array','','embedded')
    ]},
    {'id':'hotel_flex','title':'flexible_stay (embedded)','x':120,'y':930,'w':420,'color':'#8a8a8a','fields':[
        ('flexibleCheckIn.enabled','bool','','embedded'),('flexibleCheckIn.fee','number','','embedded'),('flexibleCheckIn.times[]','array','','embedded'),
        ('flexibleCheckOut.enabled','bool','','embedded'),('flexibleCheckOut.fee','number','','embedded'),('flexibleCheckOut.times[]','array','','embedded')
    ]},
    {'id':'hotel_verification','title':'verification (embedded)','x':120,'y':1180,'w':420,'color':'#8a8a8a','fields':[
        ('verificationDocs.businessLicense','string','','embedded'),('verificationDocs.touristLicense','string','','embedded'),
        ('verificationDocs.propertyOwnership','string','','embedded'),('lastInspectionDate','date','','embedded')
    ]},
    {'id':'hotel_amenities','title':'amenities (embedded)','x':1320,'y':250,'w':460,'color':'#8a8a8a','fields':[
        ('workspace','bool','','embedded'),('wifi','bool','','embedded'),('wifiSpeed','number','','embedded'),('meetingRoom','bool','','embedded'),
        ('parking','bool','','embedded'),('parkingFee','number','','embedded'),('breakfast','bool','','embedded'),('breakfastIncluded','bool','','embedded'),
        ('gym','bool','','embedded'),('pool','bool','','embedded'),('spa','bool','','embedded'),('restaurant','bool','','embedded'),
        ('roomService','bool','','embedded'),('airportShuttle','bool','','embedded'),('evCharging','bool','','embedded')
    ]},
    {'id':'hotel_accessibility','title':'accessibility_safety (embedded)','x':1320,'y':740,'w':460,'color':'#8a8a8a','fields':[
        ('wheelchairAccessible','bool','','embedded'),('elevator','bool','','embedded'),('accessibleBathroom','bool','','embedded'),
        ('visualAlarms','bool','','embedded'),('serviceAnimalsAllowed','bool','','embedded'),('frontDesk24h','bool','','embedded'),
        ('securityCameras','bool','','embedded'),('roomSafe','bool','','embedded'),('fireSafety','bool','','embedded'),
        ('wellLitParking','bool','','embedded'),('femaleOnlyFloors','bool','','embedded')
    ]},
    {'id':'hotel_media','title':'media_strikes (embedded)','x':1320,'y':1140,'w':460,'color':'#8a8a8a','fields':[
        ('hotelImages[]','array','','embedded'),('hotelVideos[]','array','','embedded'),
        ('strikeHistory[].bookingId','objectId','','embedded'),('strikeHistory[].reason','string','','embedded'),('strikeHistory[].date','date','','embedded')
    ]},
    {'id':'rooms','title':'rooms','x':600,'y':1250,'w':360,'color':'#76c442','fields':[
        ('_id','objectId','PK','pk'),('hotelId','objectId','FK','fk'),('roomType','enum','NN','normal'),('roomNumber','string','','normal'),
        ('roomName','string','NN','normal'),('basePrice','number','NN','normal'),('weekendSurcharge','number','','normal'),
        ('maxOccupancy','int','NN','normal'),('bedType','enum','NN','normal'),('bedCount','int','NN','normal'),
        ('roomSize','number','','normal'),('viewType','enum','','normal'),('roomAmenities[]','array','','embedded'),
        ('totalRooms','int','NN','normal'),('availableRooms','int','NN','normal'),('currentViewers','int','','normal'),('roomStatus','enum','NN','normal')
    ]},
    {'id':'room_deal','title':'last_minute_deal (embedded)','x':600,'y':80+1550,'w':360,'color':'#8a8a8a','fields':[
        ('isActive','bool','','embedded'),('discountPercent','number','','embedded'),('originalPrice','number','','embedded'),
        ('dealPrice','number','','embedded'),('validUntil','date','','embedded')
    ]},
    {'id':'room_inventory','title':'room_inventory','x':1020,'y':1280,'w':380,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('roomId','objectId','FK','fk'),('date','date','NN','normal'),('total','int','NN','normal'),
        ('booked','int','','normal'),('closed','bool','','normal'),('basePrice','number','','normal'),('overridePrice','number','','normal')
    ]},
    {'id':'bookings','title':'bookings','x':1860,'y':720,'w':390,'color':'#76c442','fields':[
        ('_id','objectId','PK','pk'),('guestId','objectId','FK','fk'),('hotelId','objectId','FK','fk'),('checkInDate','date','NN','normal'),
        ('checkOutDate','date','NN','normal'),('nights','int','NN','normal'),('adultCount','int','NN','normal'),('childCount','int','','normal'),
        ('subtotal','number','NN','normal'),('totalPrice','number','NN','normal'),('paymentMethod','enum','NN','normal'),
        ('paymentStatus','enum','','normal'),('bookingStatus','enum','','normal'),('paidAmount','number','','normal'),
        ('cancelledByMemberId','objectId','FK','fk'),('refundAmount','number','','normal'),('bookingCode','string','UK','normal')
    ]},
    {'id':'booking_rooms','title':'booking_rooms (embedded)','x':1860,'y':1280,'w':390,'color':'#8a8a8a','fields':[
        ('roomId','objectId','FK','fk'),('roomType','string','','embedded'),('quantity','int','NN','embedded'),
        ('pricePerNight','number','NN','embedded'),('guestName','string','','embedded')
    ]},
    {'id':'booking_ops','title':'booking_ops (embedded)','x':1860,'y':1540,'w':390,'color':'#8a8a8a','fields':[
        ('specialRequests','string','','embedded'),('earlyCheckIn','bool','','embedded'),('lateCheckOut','bool','','embedded'),
        ('cancellationFlow','enum','','embedded'),('cancellationReason','string','','embedded'),('refundReason','string','','embedded'),
        ('refundEvidence[]','array','','embedded'),('ageVerified','bool','','embedded'),('verificationMethod','string','','embedded')
    ]},
    {'id':'reviews','title':'reviews','x':1480,'y':1420,'w':340,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('reviewerId','objectId','FK','fk'),('hotelId','objectId','FK','fk'),('bookingId','objectId','FK','fk'),
        ('verifiedStay','bool','','normal'),('stayDate','date','NN','normal'),('overallRating','int','NN','normal'),
        ('cleanlinessRating','int','NN','normal'),('locationRating','int','NN','normal'),('valueRating','int','NN','normal'),
        ('serviceRating','int','NN','normal'),('amenitiesRating','int','NN','normal'),('reviewTitle','string','','normal'),
        ('reviewText','string','NN','normal'),('guestPhotos[]','array','','embedded'),('helpfulCount','int','','normal'),
        ('reviewViews','int','','normal'),('reviewStatus','enum','','normal')
    ]},
    {'id':'review_response','title':'hotel_response (embedded)','x':1480,'y':1870,'w':340,'color':'#8a8a8a','fields':[
        ('responseText','string','','embedded'),('respondedBy','objectId','','embedded'),('respondedAt','date','','embedded')
    ]},
    {'id':'price_locks','title':'price_locks','x':1020,'y':1580,'w':380,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('userId','objectId','FK','fk'),('roomId','objectId','FK','fk'),
        ('lockedPrice','number','NN','normal'),('expiresAt','date','NN','normal')
    ]},
]

page1_relations = [
    {'from':'members','to':'hotels','from_card':'1','to_card':'N','label':'owns','from_side':'left','to_side':'top'},
    {'from':'members','to':'host_apps','from_card':'1','to_card':'N','label':'submits','from_side':'right','to_side':'top'},
    {'from':'members','to':'host_apps','from_card':'1','to_card':'0..N','label':'reviews','from_side':'right','to_side':'left','style':'dashed'},
    {'from':'hotels','to':'hotel_location','from_card':'1','to_card':'1','label':'loc','from_side':'left','to_side':'right','style':'dashed'},
    {'from':'hotels','to':'hotel_policy','from_card':'1','to_card':'1','label':'policy','from_side':'left','to_side':'right','style':'dashed'},
    {'from':'hotels','to':'hotel_flex','from_card':'1','to_card':'1','label':'flex','from_side':'left','to_side':'right','style':'dashed'},
    {'from':'hotels','to':'hotel_verification','from_card':'1','to_card':'1','label':'verify','from_side':'left','to_side':'right','style':'dashed'},
    {'from':'hotels','to':'hotel_amenities','from_card':'1','to_card':'1','label':'amen','from_side':'top','to_side':'left','style':'dashed'},
    {'from':'hotels','to':'hotel_accessibility','from_card':'1','to_card':'1','label':'safe','from_side':'right','to_side':'left','style':'dashed'},
    {'from':'hotels','to':'hotel_media','from_card':'1','to_card':'1','label':'media','from_side':'right','to_side':'left','style':'dashed'},
    {'from':'hotels','to':'rooms','from_card':'1','to_card':'N','label':'contains','from_side':'bottom','to_side':'top'},
    {'from':'rooms','to':'room_deal','from_card':'1','to_card':'0..1','label':'promo','style':'dashed'},
    {'from':'rooms','to':'room_inventory','from_card':'1','to_card':'N','label':'tracks','from_side':'right','to_side':'left'},
    {'from':'members','to':'bookings','from_card':'1','to_card':'N','label':'makes','from_side':'bottom','to_side':'top'},
    {'from':'hotels','to':'bookings','from_card':'1','to_card':'N','label':'receives','from_side':'right','to_side':'left'},
    {'from':'bookings','to':'booking_rooms','from_card':'1','to_card':'N','label':'rooms','style':'dashed'},
    {'from':'bookings','to':'booking_ops','from_card':'1','to_card':'1','label':'ops','style':'dashed'},
    {'from':'rooms','to':'booking_rooms','from_card':'1','to_card':'N','label':'reserved','from_side':'right','to_side':'left'},
    {'from':'members','to':'reviews','from_card':'1','to_card':'N','label':'writes','from_side':'bottom','to_side':'top'},
    {'from':'hotels','to':'reviews','from_card':'1','to_card':'N','label':'receives','from_side':'bottom','to_side':'left'},
    {'from':'bookings','to':'reviews','from_card':'1','to_card':'0..1','label':'results','from_side':'bottom','to_side':'top'},
    {'from':'reviews','to':'review_response','from_card':'1','to_card':'0..1','label':'reply','style':'dashed'},
    {'from':'members','to':'price_locks','from_card':'1','to_card':'N','label':'creates','from_side':'bottom','to_side':'top'},
    {'from':'rooms','to':'price_locks','from_card':'1','to_card':'N','label':'applies','from_side':'bottom','to_side':'left'},
]

page1_notes = [
    'Core business layer with hotel schema expanded into embedded value objects instead of one collapsed card',
    'Gray cards are embedded subdocuments stored inside parent Hotel, Booking, Room or Review documents',
    'This page is hotel-heavy by design because Hotel is the densest aggregate in the backend'
]

page2_boxes = [
    {'id':'members','title':'members','x':1000,'y':290,'w':360,'color':'#f4b400','fields':[
        ('_id','objectId','PK','pk'),('memberType','enum','NN','normal'),('memberStatus','enum','NN','normal'),('memberPhone','string','UK','normal'),
        ('memberNick','string','UK','normal'),('memberFollowers','int','','normal'),('memberFollowings','int','','normal'),('memberLikes','int','','normal'),('memberViews','int','','normal')
    ]},
    {'id':'hotels_ctx','title':'hotels (context)','x':120,'y':230,'w':300,'color':'#76c442','fields':[
        ('_id','objectId','PK','pk'),('hotelTitle','string','NN','normal'),('hotelStatus','enum','','normal'),('hotelRank','int','','normal')
    ]},
    {'id':'bookings_ctx','title':'bookings (context)','x':120,'y':540,'w':300,'color':'#76c442','fields':[
        ('_id','objectId','PK','pk'),('guestId','objectId','FK','fk'),('hotelId','objectId','FK','fk'),('bookingStatus','enum','','normal')
    ]},
    {'id':'likes','title':'likes','x':480,'y':210,'w':320,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('memberId','objectId','FK','fk'),('likeRefId','objectId','','normal'),('likeGroup','enum','NN','normal'),('createdAt','date','','normal')
    ]},
    {'id':'views','title':'views','x':480,'y':500,'w':320,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('memberId','objectId','FK','fk'),('viewRefId','objectId','','normal'),('viewGroup','enum','NN','normal'),('createdAt','date','','normal')
    ]},
    {'id':'chats','title':'chats','x':480,'y':850,'w':360,'color':'#f4b400','fields':[
        ('_id','objectId','PK','pk'),('guestId','objectId','FK','fk'),('hotelId','objectId','FK','fk'),('assignedAgentId','objectId','FK','fk'),('bookingId','objectId','FK','fk'),('chatScope','enum','NN','normal'),('chatStatus','enum','NN','normal'),('lastMessageAt','date','','normal')
    ]},
    {'id':'chat_messages','title':'chat_messages (embedded)','x':480,'y':1210,'w':360,'color':'#8a8a8a','fields':[
        ('senderId','objectId','','embedded'),('senderType','enum','NN','embedded'),('messageType','enum','','embedded'),('content','string','','embedded'),('imageUrl','string','','embedded'),('fileUrl','string','','embedded'),('readByMemberIds[]','array','','embedded'),('timestamp','date','','embedded')
    ]},
    {'id':'notifications','title':'notifications','x':1560,'y':220,'w':340,'color':'#8a8a8a','fields':[
        ('_id','objectId','PK','pk'),('userId','objectId','FK','fk'),('type','enum','NN','normal'),('title','string','NN','normal'),('read','bool','','normal'),('link','string','','normal'),('createdAt','date','','normal')
    ]},
    {'id':'follows','title':'follows','x':1560,'y':520,'w':340,'color':'#ff4747','fields':[
        ('_id','objectId','PK','pk'),('followerId','objectId','FK','fk'),('followingId','objectId','FK','fk'),('createdAt','date','','normal')
    ]},
    {'id':'refresh_tokens','title':'refresh_tokens','x':1960,'y':220,'w':320,'color':'#8a8a8a','fields':[
        ('_id','objectId','PK','pk'),('memberId','objectId','FK','fk'),('tokenHash','string','UK','normal'),('expiresAt','date','NN','normal'),('revoked','bool','','normal')
    ]},
    {'id':'search_history','title':'search_history','x':930,'y':900,'w':360,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('memberId','objectId','FK','fk'),('location','enum','','normal'),('hotelTypes[]','array','','embedded'),('purpose','enum','','normal'),('amenities[]','array','','embedded'),('starRatings[]','array','','embedded'),('guestCount','int','','normal'),('fingerprint','string','','normal')
    ]},
    {'id':'user_profile','title':'user_profile','x':930,'y':1220,'w':360,'color':'#f4b400','fields':[
        ('_id','objectId','PK','pk'),('memberId','objectId','FK','fk'),('preferredLocations[]','array','','embedded'),('preferredTypes[]','array','','embedded'),('preferredAmenities[]','array','','embedded'),('viewedHotelIds[]','array','','embedded'),('likedHotelIds[]','array','','embedded'),('bookedHotelIds[]','array','','embedded'),('source','enum','','normal'),('computedAt','date','','normal')
    ]},
    {'id':'analytics','title':'analytics_events','x':1360,'y':900,'w':360,'color':'#10b5f5','fields':[
        ('_id','objectId','PK','pk'),('memberId','objectId','FK','fk'),('memberType','enum','NN','normal'),('eventName','string','NN','normal'),('eventPath','string','','normal'),('source','string','','normal'),('createdAt','date','','normal')
    ]},
    {'id':'recommendation_cache','title':'recommendation_cache','x':1770,'y':980,'w':420,'color':'#8a8a8a','fields':[
        ('_id','objectId','PK','pk'),('cacheKey','string','UK','normal'),('data','mixed','NN','normal'),('computedAt','date','NN','normal'),('expiresAt','date','NN','normal')
    ]},
]

page2_relations = [
    {'from':'members','to':'likes','from_card':'1','to_card':'N','label':'creates'},
    {'from':'members','to':'views','from_card':'1','to_card':'N','label':'creates'},
    {'from':'likes','to':'hotels_ctx','from_card':'N','to_card':'N*','label':'targets','style':'dashed'},
    {'from':'views','to':'hotels_ctx','from_card':'N','to_card':'N*','label':'targets','style':'dashed'},
    {'from':'members','to':'chats','from_card':'1','to_card':'N','label':'opens'},
    {'from':'bookings_ctx','to':'chats','from_card':'1','to_card':'0..N','label':'context'},
    {'from':'hotels_ctx','to':'chats','from_card':'1','to_card':'N','label':'hotel'},
    {'from':'chats','to':'chat_messages','from_card':'1','to_card':'N','label':'contains','style':'dashed'},
    {'from':'members','to':'notifications','from_card':'1','to_card':'N','label':'receives'},
    {'from':'members','to':'follows','from_card':'1','to_card':'N','label':'follower'},
    {'from':'members','to':'follows','from_card':'1','to_card':'N','label':'following','from_side':'right','to_side':'bottom','style':'dashed'},
    {'from':'members','to':'refresh_tokens','from_card':'1','to_card':'N','label':'auth'},
    {'from':'members','to':'search_history','from_card':'1','to_card':'N','label':'searches'},
    {'from':'members','to':'user_profile','from_card':'1','to_card':'1','label':'profile'},
    {'from':'user_profile','to':'hotels_ctx','from_card':'N*','to_card':'N*','label':'hotel refs','style':'dashed'},
    {'from':'members','to':'analytics','from_card':'1','to_card':'N','label':'generates'},
    {'from':'user_profile','to':'recommendation_cache','from_card':'1','to_card':'N','label':'feeds','style':'dashed'},
    {'from':'search_history','to':'recommendation_cache','from_card':'N','to_card':'N','label':'signals','style':'dashed'},
    {'from':'likes','to':'recommendation_cache','from_card':'N','to_card':'N','label':'signals','style':'dashed'},
    {'from':'views','to':'recommendation_cache','from_card':'N','to_card':'N','label':'signals','style':'dashed'},
]

page2_notes = [
    'Engagement/auth layer: realtime chat, notifications, follows, behavior signals, recommendation inputs',
    'N* marks polymorphic or array-based references, mostly targeting Hotel entities',
    'Gray cards are embedded docs or cache/auth infrastructure records'
]

files = [
    render_page('meomul-er-model-core.svg', 'Meomul ER Model I', 'Core booking, hosting and inventory domain', 'Page 1 · Core Domain', page1_boxes, page1_relations, page1_notes),
    render_page('meomul-er-model-engagement.svg', 'Meomul ER Model II', 'Engagement, auth and personalization layer', 'Page 2 · Engagement & Personalization', page2_boxes, page2_relations, page2_notes),
]
for f in files:
    print(f)
