from pathlib import Path
from xml.sax.saxutils import escape

OUT_DIR = Path('/Users/kamil/Desktop/Meomul/docs/assets')
OUT_DIR.mkdir(parents=True, exist_ok=True)
SVG_OUT = OUT_DIR / 'meomul-er-model-portfolio.svg'
PNG_OUT = OUT_DIR / 'meomul-er-model-portfolio.png'

CANVAS_W = 2400
CANVAS_H = 1600
BG = '#353535'
CARD = '#3f3f3f'
CARD_BORDER = '#2f2f2f'
LINE = '#c6c6c6'
TEXT = '#f1f1f1'
TEXT_DIM = '#d0d0d0'
TYPE = '#d6d6d6'
FLAG = '#f0f0f0'


boxes = [
    {
        'id': 'host_applications', 'title': 'host_applications', 'x': 90, 'y': 90, 'w': 300, 'color': '#78c51c',
        'fields': [
            ('_id', 'objectId', 'NN', 'pk'),
            ('applicantMemberId', 'objectId', 'NN', 'fk'),
            ('reviewedByMemberId', 'objectId', '', 'fk'),
            ('businessName', 'string', 'NN', 'normal'),
            ('hotelType', 'enum', 'NN', 'normal'),
            ('status', 'enum', 'NN', 'normal'),
            ('createdAt', 'date', 'NN', 'normal'),
        ],
    },
    {
        'id': 'likes', 'title': 'likes', 'x': 470, 'y': 80, 'w': 260, 'color': '#10a5ea',
        'fields': [
            ('_id', 'objectId', 'NN', 'pk'),
            ('likeRefId', 'objectId', 'NN', 'normal'),
            ('likeGroup', 'enum', 'NN', 'normal'),
            ('memberId', 'objectId', 'NN', 'fk'),
            ('createdAt', 'date', 'NN', 'normal'),
        ],
    },
    {
        'id': 'pricelocks', 'title': 'price_locks', 'x': 820, 'y': 80, 'w': 260, 'color': '#10a5ea',
        'fields': [
            ('_id', 'objectId', 'NN', 'pk'),
            ('userId', 'objectId', 'NN', 'fk'),
            ('roomId', 'objectId', 'NN', 'fk'),
            ('lockedPrice', 'int', 'NN', 'normal'),
            ('expiresAt', 'date', 'NN', 'normal'),
        ],
    },
    {
        'id': 'views', 'title': 'views', 'x': 1170, 'y': 80, 'w': 260, 'color': '#10a5ea',
        'fields': [
            ('_id', 'objectId', 'NN', 'pk'),
            ('viewRefId', 'objectId', 'NN', 'normal'),
            ('viewGroup', 'enum', 'NN', 'normal'),
            ('memberId', 'objectId', 'NN', 'fk'),
            ('createdAt', 'date', 'NN', 'normal'),
        ],
    },
    {
        'id': 'notifications', 'title': 'notifications', 'x': 1960, 'y': 80, 'w': 290, 'color': '#7a7a7a',
        'fields': [
            ('_id', 'objectId', 'NN', 'pk'),
            ('userId', 'objectId', 'NN', 'fk'),
            ('type', 'enum', 'NN', 'normal'),
            ('title', 'string', 'NN', 'normal'),
            ('read', 'bool', 'NN', 'normal'),
            ('createdAt', 'date', 'NN', 'normal'),
        ],
    },
    {
        'id': 'hotels', 'title': 'hotels', 'x': 90, 'y': 390, 'w': 320, 'color': '#78c51c',
        'fields': [
            ('_id', 'objectId', 'NN', 'pk'),
            ('memberId', 'objectId', 'NN', 'fk'),
            ('hotelType', 'enum', 'NN', 'normal'),
            ('hotelTitle', 'string', 'NN', 'normal'),
            ('hotelLocation', 'enum', 'NN', 'normal'),
            ('hotelStatus', 'enum', 'NN', 'normal'),
            ('verificationStatus', 'enum', '', 'normal'),
            ('startingPrice', 'int', '', 'normal'),
            ('hotelRating', 'double', '', 'normal'),
            ('createdAt', 'date', 'NN', 'normal'),
        ],
    },
    {
        'id': 'analytics_events', 'title': 'analytics_events', 'x': 470, 'y': 390, 'w': 280, 'color': '#10a5ea',
        'fields': [
            ('_id', 'objectId', 'NN', 'pk'),
            ('memberId', 'objectId', '', 'fk'),
            ('memberType', 'enum', 'NN', 'normal'),
            ('eventName', 'string', 'NN', 'normal'),
            ('eventPath', 'string', '', 'normal'),
            ('source', 'string', '', 'normal'),
            ('createdAt', 'date', 'NN', 'normal'),
        ],
    },
    {
        'id': 'members', 'title': 'members', 'x': 920, 'y': 355, 'w': 360, 'color': '#ffbf00',
        'fields': [
            ('_id', 'objectId', 'NN', 'pk'),
            ('memberType', 'enum', 'NN', 'normal'),
            ('memberStatus', 'enum', 'NN', 'normal'),
            ('hostAccessStatus', 'enum', 'NN', 'normal'),
            ('memberPhone', 'string', 'NN', 'normal'),
            ('memberNick', 'string', 'NN', 'normal'),
            ('subscriptionTier', 'enum', '', 'normal'),
            ('memberFollowers', 'int', '', 'normal'),
            ('memberFollowings', 'int', '', 'normal'),
            ('memberLikes', 'int', '', 'normal'),
            ('memberViews', 'int', '', 'normal'),
            ('createdAt', 'date', 'NN', 'normal'),
        ],
    },
    {
        'id': 'bookings', 'title': 'bookings', 'x': 1480, 'y': 390, 'w': 320, 'color': '#ffbf00',
        'fields': [
            ('_id', 'objectId', 'NN', 'pk'),
            ('guestId', 'objectId', 'NN', 'fk'),
            ('hotelId', 'objectId', 'NN', 'fk'),
            ('bookingCode', 'string', 'NN', 'normal'),
            ('checkInDate', 'date', 'NN', 'normal'),
            ('checkOutDate', 'date', 'NN', 'normal'),
            ('nights', 'int', 'NN', 'normal'),
            ('totalPrice', 'int', 'NN', 'normal'),
            ('paymentStatus', 'enum', '', 'normal'),
            ('bookingStatus', 'enum', '', 'normal'),
            ('createdAt', 'date', 'NN', 'normal'),
        ],
    },
    {
        'id': 'reviews', 'title': 'reviews', 'x': 1960, 'y': 390, 'w': 290, 'color': '#10d0ee',
        'fields': [
            ('_id', 'objectId', 'NN', 'pk'),
            ('reviewerId', 'objectId', 'NN', 'fk'),
            ('hotelId', 'objectId', 'NN', 'fk'),
            ('bookingId', 'objectId', '', 'fk'),
            ('overallRating', 'int', 'NN', 'normal'),
            ('reviewStatus', 'enum', '', 'normal'),
            ('helpfulCount', 'int', '', 'normal'),
            ('createdAt', 'date', 'NN', 'normal'),
        ],
    },
    {
        'id': 'rooms', 'title': 'rooms', 'x': 90, 'y': 840, 'w': 300, 'color': '#78c51c',
        'fields': [
            ('_id', 'objectId', 'NN', 'pk'),
            ('hotelId', 'objectId', 'NN', 'fk'),
            ('roomType', 'enum', 'NN', 'normal'),
            ('roomName', 'string', 'NN', 'normal'),
            ('basePrice', 'int', 'NN', 'normal'),
            ('maxOccupancy', 'int', 'NN', 'normal'),
            ('availableRooms', 'int', 'NN', 'normal'),
            ('roomStatus', 'enum', 'NN', 'normal'),
        ],
    },
    {
        'id': 'searchhistories', 'title': 'search_histories', 'x': 470, 'y': 800, 'w': 280, 'color': '#10a5ea',
        'fields': [
            ('_id', 'objectId', 'NN', 'pk'),
            ('memberId', 'objectId', 'NN', 'fk'),
            ('location', 'enum', '', 'normal'),
            ('purpose', 'enum', '', 'normal'),
            ('guestCount', 'int', '', 'normal'),
            ('fingerprint', 'string', '', 'normal'),
            ('createdAt', 'date', 'NN', 'normal'),
        ],
    },
    {
        'id': 'chats', 'title': 'chats', 'x': 1480, 'y': 800, 'w': 320, 'color': '#10d0ee',
        'fields': [
            ('_id', 'objectId', 'NN', 'pk'),
            ('guestId', 'objectId', 'NN', 'fk'),
            ('hotelId', 'objectId', '', 'fk'),
            ('assignedAgentId', 'objectId', '', 'fk'),
            ('bookingId', 'objectId', '', 'fk'),
            ('chatScope', 'enum', 'NN', 'normal'),
            ('chatStatus', 'enum', 'NN', 'normal'),
            ('lastMessageAt', 'date', 'NN', 'normal'),
        ],
    },
    {
        'id': 'follows', 'title': 'follows', 'x': 1960, 'y': 800, 'w': 290, 'color': '#ff3030',
        'fields': [
            ('_id', 'objectId', 'NN', 'pk'),
            ('followerId', 'objectId', 'NN', 'fk'),
            ('followingId', 'objectId', 'NN', 'fk'),
            ('createdAt', 'date', 'NN', 'normal'),
        ],
    },
    {
        'id': 'roominventories', 'title': 'room_inventories', 'x': 90, 'y': 1140, 'w': 300, 'color': '#78c51c',
        'fields': [
            ('_id', 'objectId', 'NN', 'pk'),
            ('roomId', 'objectId', 'NN', 'fk'),
            ('date', 'date', 'NN', 'normal'),
            ('total', 'int', 'NN', 'normal'),
            ('booked', 'int', 'NN', 'normal'),
            ('overridePrice', 'int', '', 'normal'),
            ('closed', 'bool', '', 'normal'),
        ],
    },
    {
        'id': 'userprofiles', 'title': 'user_profiles', 'x': 820, 'y': 1120, 'w': 280, 'color': '#ffbf00',
        'fields': [
            ('_id', 'objectId', 'NN', 'pk'),
            ('memberId', 'objectId', 'NN', 'fk'),
            ('preferredLocations', 'array', '', 'normal'),
            ('preferredTypes', 'array', '', 'normal'),
            ('preferredAmenities', 'array', '', 'normal'),
            ('likedHotelIds', 'array', '', 'normal'),
            ('computedAt', 'date', 'NN', 'normal'),
        ],
    },
    {
        'id': 'refreshTokens', 'title': 'refresh_tokens', 'x': 1180, 'y': 1140, 'w': 280, 'color': '#ffbf00',
        'fields': [
            ('_id', 'objectId', 'NN', 'pk'),
            ('memberId', 'objectId', 'NN', 'fk'),
            ('tokenHash', 'string', 'NN', 'normal'),
            ('expiresAt', 'date', 'NN', 'normal'),
            ('revoked', 'bool', '', 'normal'),
            ('createdAt', 'date', 'NN', 'normal'),
        ],
    },
    {
        'id': 'recommendationcaches', 'title': 'recommendation_cache', 'x': 1840, 'y': 1135, 'w': 410, 'color': '#7a7a7a',
        'fields': [
            ('_id', 'objectId', 'NN', 'pk'),
            ('cacheKey', 'string', 'NN', 'normal'),
            ('data', 'mixed', 'NN', 'normal'),
            ('computedAt', 'date', 'NN', 'normal'),
            ('expiresAt', 'date', 'NN', 'normal'),
        ],
    },
]


def box_height(fields):
    return 46 + 18 + len(fields) * 28 + 18


def anchor(box, side):
    x, y, w, h = box['x'], box['y'], box['w'], box['h']
    if side == 'left':
        return (x, y + h / 2)
    if side == 'right':
        return (x + w, y + h / 2)
    if side == 'top':
        return (x + w / 2, y)
    return (x + w / 2, y + h)


def draw_one_marker(parts, point, direction):
    x, y = point
    if direction == 'right':
        parts.append(f'<line x1="{x-7}" y1="{y-8}" x2="{x-7}" y2="{y+8}" class="marker"/>')
        parts.append(f'<line x1="{x-12}" y1="{y-8}" x2="{x-12}" y2="{y+8}" class="marker"/>')
    elif direction == 'left':
        parts.append(f'<line x1="{x+7}" y1="{y-8}" x2="{x+7}" y2="{y+8}" class="marker"/>')
        parts.append(f'<line x1="{x+12}" y1="{y-8}" x2="{x+12}" y2="{y+8}" class="marker"/>')
    elif direction == 'down':
        parts.append(f'<line x1="{x-8}" y1="{y-7}" x2="{x+8}" y2="{y-7}" class="marker"/>')
        parts.append(f'<line x1="{x-8}" y1="{y-12}" x2="{x+8}" y2="{y-12}" class="marker"/>')
    else:
        parts.append(f'<line x1="{x-8}" y1="{y+7}" x2="{x+8}" y2="{y+7}" class="marker"/>')
        parts.append(f'<line x1="{x-8}" y1="{y+12}" x2="{x+8}" y2="{y+12}" class="marker"/>')


def draw_many_marker(parts, point, direction):
    x, y = point
    if direction == 'right':
        parts.append(f'<line x1="{x}" y1="{y}" x2="{x-12}" y2="{y}" class="marker"/>')
        parts.append(f'<line x1="{x}" y1="{y}" x2="{x-12}" y2="{y-8}" class="marker"/>')
        parts.append(f'<line x1="{x}" y1="{y}" x2="{x-12}" y2="{y+8}" class="marker"/>')
    elif direction == 'left':
        parts.append(f'<line x1="{x}" y1="{y}" x2="{x+12}" y2="{y}" class="marker"/>')
        parts.append(f'<line x1="{x}" y1="{y}" x2="{x+12}" y2="{y-8}" class="marker"/>')
        parts.append(f'<line x1="{x}" y1="{y}" x2="{x+12}" y2="{y+8}" class="marker"/>')
    elif direction == 'down':
        parts.append(f'<line x1="{x}" y1="{y}" x2="{x}" y2="{y-12}" class="marker"/>')
        parts.append(f'<line x1="{x}" y1="{y}" x2="{x-8}" y2="{y-12}" class="marker"/>')
        parts.append(f'<line x1="{x}" y1="{y}" x2="{x+8}" y2="{y-12}" class="marker"/>')
    else:
        parts.append(f'<line x1="{x}" y1="{y}" x2="{x}" y2="{y+12}" class="marker"/>')
        parts.append(f'<line x1="{x}" y1="{y}" x2="{x-8}" y2="{y+12}" class="marker"/>')
        parts.append(f'<line x1="{x}" y1="{y}" x2="{x+8}" y2="{y+12}" class="marker"/>')


def draw_zero_one_marker(parts, point, direction):
    x, y = point
    parts.append(f'<circle cx="{x}" cy="{y}" r="5" fill="none" stroke="{LINE}" stroke-width="1.6"/>')
    if direction == 'right':
        parts.append(f'<line x1="{x-13}" y1="{y-8}" x2="{x-13}" y2="{y+8}" class="marker"/>')
    elif direction == 'left':
        parts.append(f'<line x1="{x+13}" y1="{y-8}" x2="{x+13}" y2="{y+8}" class="marker"/>')
    elif direction == 'down':
        parts.append(f'<line x1="{x-8}" y1="{y-13}" x2="{x+8}" y2="{y-13}" class="marker"/>')
    else:
        parts.append(f'<line x1="{x-8}" y1="{y+13}" x2="{x+8}" y2="{y+13}" class="marker"/>')


def segment_direction(a, b):
    if abs(b[0] - a[0]) >= abs(b[1] - a[1]):
        return 'right' if b[0] > a[0] else 'left'
    return 'down' if b[1] > a[1] else 'up'


def draw_cardinality(parts, point, near, card):
    direction = segment_direction(near, point)
    if card == '1':
        draw_one_marker(parts, point, direction)
    elif card == 'N':
        draw_many_marker(parts, point, direction)
    elif card == '0..1':
        draw_zero_one_marker(parts, point, direction)


for box in boxes:
    box['h'] = box_height(box['fields'])

box_map = {b['id']: b for b in boxes}

relations = [
    {'from': 'members', 'from_side': 'top', 'to': 'host_applications', 'to_side': 'right', 'from_card': '1', 'to_card': 'N', 'via': [(920, 420), (430, 420), (430, 170)]},
    {'from': 'members', 'from_side': 'top', 'to': 'likes', 'to_side': 'bottom', 'from_card': '1', 'to_card': 'N', 'via': [(1010, 330), (600, 330), (600, 248)]},
    {'from': 'members', 'from_side': 'top', 'to': 'views', 'to_side': 'bottom', 'from_card': '1', 'to_card': 'N', 'via': [(1190, 330), (1300, 330), (1300, 248)]},
    {'from': 'members', 'from_side': 'top', 'to': 'notifications', 'to_side': 'left', 'from_card': '1', 'to_card': 'N', 'via': [(1230, 330), (1900, 330), (1900, 180)]},
    {'from': 'members', 'from_side': 'left', 'to': 'hotels', 'to_side': 'right', 'from_card': '1', 'to_card': 'N', 'via': [(870, 530), (430, 530)]},
    {'from': 'members', 'from_side': 'right', 'to': 'bookings', 'to_side': 'left', 'from_card': '1', 'to_card': 'N', 'via': [(1310, 530), (1450, 530)]},
    {'from': 'members', 'from_side': 'right', 'to': 'reviews', 'to_side': 'left', 'from_card': '1', 'to_card': 'N', 'via': [(1310, 590), (1940, 590)]},
    {'from': 'members', 'from_side': 'bottom', 'to': 'searchhistories', 'to_side': 'top', 'from_card': '1', 'to_card': 'N', 'via': [(1080, 730), (610, 730), (610, 800)]},
    {'from': 'members', 'from_side': 'bottom', 'to': 'userprofiles', 'to_side': 'top', 'from_card': '1', 'to_card': '1', 'via': [(1080, 730), (960, 730), (960, 1120)]},
    {'from': 'members', 'from_side': 'bottom', 'to': 'refreshTokens', 'to_side': 'top', 'from_card': '1', 'to_card': 'N', 'via': [(1150, 730), (1320, 730), (1320, 1140)]},
    {'from': 'members', 'from_side': 'left', 'to': 'analytics_events', 'to_side': 'right', 'from_card': '1', 'to_card': 'N', 'via': [(870, 650), (760, 650)]},
    {'from': 'members', 'from_side': 'right', 'to': 'chats', 'to_side': 'left', 'from_card': '1', 'to_card': 'N', 'via': [(1310, 690), (1450, 690)]},
    {'from': 'members', 'from_side': 'right', 'to': 'follows', 'to_side': 'left', 'from_card': '1', 'to_card': 'N', 'via': [(1310, 740), (1935, 740), (1935, 900)]},
    {'from': 'members', 'from_side': 'right', 'to': 'follows', 'to_side': 'left', 'from_card': '1', 'to_card': 'N', 'via': [(1310, 770), (1910, 770), (1910, 950)]},
    {'from': 'members', 'from_side': 'top', 'to': 'pricelocks', 'to_side': 'bottom', 'from_card': '1', 'to_card': 'N', 'via': [(1080, 330), (950, 330), (950, 220)]},
    {'from': 'hotels', 'from_side': 'bottom', 'to': 'rooms', 'to_side': 'top', 'from_card': '1', 'to_card': 'N', 'via': [(250, 710), (250, 840)]},
    {'from': 'rooms', 'from_side': 'bottom', 'to': 'roominventories', 'to_side': 'top', 'from_card': '1', 'to_card': 'N', 'via': [(240, 1060), (240, 1140)]},
    {'from': 'hotels', 'from_side': 'right', 'to': 'bookings', 'to_side': 'left', 'from_card': '1', 'to_card': 'N', 'via': [(430, 560), (1450, 560)]},
    {'from': 'hotels', 'from_side': 'right', 'to': 'reviews', 'to_side': 'left', 'from_card': '1', 'to_card': 'N', 'via': [(430, 610), (1940, 610)]},
    {'from': 'hotels', 'from_side': 'right', 'to': 'chats', 'to_side': 'left', 'from_card': '1', 'to_card': 'N', 'via': [(430, 660), (1450, 660)]},
    {'from': 'bookings', 'from_side': 'right', 'to': 'reviews', 'to_side': 'left', 'from_card': '1', 'to_card': '0..1', 'via': [(1810, 570), (1940, 570)]},
    {'from': 'bookings', 'from_side': 'bottom', 'to': 'chats', 'to_side': 'top', 'from_card': '1', 'to_card': '0..N', 'via': [(1640, 720), (1640, 800)]},
    {'from': 'rooms', 'from_side': 'right', 'to': 'pricelocks', 'to_side': 'bottom', 'from_card': '1', 'to_card': 'N', 'via': [(410, 920), (950, 920), (950, 220)]},
    {'from': 'likes', 'from_side': 'bottom', 'to': 'hotels', 'to_side': 'top', 'from_card': 'N', 'to_card': 'N', 'via': [(600, 248), (600, 350), (250, 350)]},
    {'from': 'views', 'from_side': 'bottom', 'to': 'hotels', 'to_side': 'top', 'from_card': 'N', 'to_card': 'N', 'via': [(1300, 248), (1300, 310), (250, 310)]},
    {'from': 'searchhistories', 'from_side': 'right', 'to': 'recommendationcaches', 'to_side': 'left', 'from_card': 'N', 'to_card': 'N', 'via': [(760, 930), (1830, 930), (1830, 1230)]},
    {'from': 'userprofiles', 'from_side': 'right', 'to': 'recommendationcaches', 'to_side': 'left', 'from_card': '1', 'to_card': 'N', 'via': [(1110, 1260), (1830, 1260)]},
    {'from': 'analytics_events', 'from_side': 'right', 'to': 'recommendationcaches', 'to_side': 'left', 'from_card': 'N', 'to_card': 'N', 'via': [(760, 520), (1790, 520), (1790, 1200)]},
]


def render_box(parts, box):
    x, y, w, h = box['x'], box['y'], box['w'], box['h']
    parts.append(f'<g filter="url(#shadow)">')
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3" fill="{CARD}" stroke="{CARD_BORDER}" stroke-width="1.2"/>')
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="32" fill="{box["color"]}" rx="3"/>')
    parts.append(f'<rect x="{x}" y="{y+27}" width="{w}" height="5" fill="{box["color"]}"/>')
    parts.append(f'<text x="{x + w/2}" y="{y + 22}" text-anchor="middle" class="title">{escape(box["title"])}</text>')
    row_y = y + 54
    for idx, (name, ftype, flag, kind) in enumerate(box['fields']):
        yy = row_y + idx * 28
        if kind == 'pk':
            icon = '<rect x="0" y="0" width="9" height="9" rx="2" fill="#ffcc00"/>'
        elif kind == 'fk':
            icon = '<rect x="0" y="0" width="9" height="9" rx="2" fill="none" stroke="#ffae00" stroke-width="1.6"/>'
        else:
            icon = '<circle cx="4.5" cy="4.5" r="3" fill="#9aa0a6"/>'
        parts.append(f'<g transform="translate({x + 12},{yy - 8})">{icon}</g>')
        parts.append(f'<text x="{x + 30}" y="{yy}" class="field">{escape(name)}</text>')
        parts.append(f'<text x="{x + w - 86}" y="{yy}" class="type">{escape(ftype)}</text>')
        parts.append(f'<text x="{x + w - 16}" y="{yy}" text-anchor="end" class="flag">{escape(flag)}</text>')
    parts.append('</g>')


parts = []
append = parts.append
append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{CANVAS_W}" height="{CANVAS_H}" viewBox="0 0 {CANVAS_W} {CANVAS_H}">')
append(f'''<defs>
<style>
.bg-title {{ font: 600 26px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; fill: #f3f3f3; }}
.bg-sub {{ font: 500 13px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; fill: #bbbbbb; }}
.title {{ font: 700 14px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; fill: #ffffff; letter-spacing: .02em; }}
.field {{ font: 600 12px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; fill: {TEXT}; }}
.type {{ font: italic 600 12px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; fill: {TYPE}; }}
.flag {{ font: 700 12px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; fill: {FLAG}; }}
.line {{ stroke: {LINE}; stroke-width: 2.0; fill: none; opacity: 0.92; }}
.marker {{ stroke: {LINE}; stroke-width: 1.8; }}
.note {{ font: 600 11px -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; fill: #b8b8b8; }}
</style>
<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
  <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000000" flood-opacity="0.24"/>
</filter>
</defs>''')
append(f'<rect x="0" y="0" width="{CANVAS_W}" height="{CANVAS_H}" fill="{BG}"/>')
append('<text x="46" y="52" class="bg-title">Meomul · ER Modeling</text>')
append('<text x="46" y="74" class="bg-sub">Persistence layer only · DTO and transport types removed · dense schema view</text>')

for rel in relations:
    start = anchor(box_map[rel['from']], rel['from_side'])
    end = anchor(box_map[rel['to']], rel['to_side'])
    pts = [start] + rel.get('via', []) + [end]
    path = ' '.join(f'{x},{y}' for x, y in pts)
    append(f'<polyline points="{path}" class="line"/>')
    if len(pts) >= 2:
        draw_cardinality(parts, pts[0], pts[1], rel['from_card'])
        draw_cardinality(parts, pts[-1], pts[-2], rel['to_card'])

for box in boxes:
    render_box(parts, box)

append('<text x="42" y="1570" class="note">PK: filled square · FK: outlined square · all entities are real Mongo persistence schemas from meomul-api</text>')
append('</svg>')
SVG_OUT.write_text(''.join(parts), encoding='utf-8')
print(SVG_OUT)
