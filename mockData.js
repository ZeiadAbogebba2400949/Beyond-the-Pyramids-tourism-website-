

window.MockData = {



    accounts: {
        admin: { name: 'Admin Operations', email: 'admin@egypt.com', password: 'admin123', role: 'Admin', dashboard: '../AdminDashboardPage/admin-dashboard.html' },
        planner: { name: 'Trip Planner', email: 'planner@egypt.com', password: 'planner123', role: 'Planner', dashboard: '../PlannerDashboardPage/PlannerDashboard.html' },
        booking: { name: 'Booking Manager', email: 'booking@egypt.com', password: 'booking123', role: 'Booking Manager', dashboard: '../BookingManagmentDashboardPage/booking-dashboard.html' },
        support: { name: 'Support Agent', email: 'support@egypt.com', password: 'support123', role: 'Customer Support', dashboard: '../CustomerSupportDashboardPage/support-dashboard.html' },
        user: { name: 'Ahmed Traveler', email: 'user@egypt.com', password: 'user123', role: 'Tourist', dashboard: '../UserDashboardPage/dashboard.html' }
    },




    users: [
        { id: 'USR-001', name: 'Ahmed Traveler',    email: 'user@egypt.com',       phone: '+20 100 111 2222', nationality: 'Egypt',   role: 'user',  status: 'active',    joinDate: '2025-11-10', password: 'user123',  image: 'https://randomuser.me/api/portraits/men/11.jpg' },
        { id: 'USR-002', name: 'Emily Carter',       email: 'emily@travel.com',     phone: '+1 555 123 4567',  nationality: 'USA',     role: 'user',  status: 'active',    joinDate: '2026-01-05', password: 'emily123', image: 'https://randomuser.me/api/portraits/women/21.jpg' },
        { id: 'USR-003', name: "Liam O'Brien",       email: 'liam@travel.com',      phone: '+44 20 7946 0958', nationality: 'UK',      role: 'user',  status: 'active',    joinDate: '2026-01-22', password: 'liam123',  image: 'https://randomuser.me/api/portraits/men/34.jpg' },
        { id: 'USR-004', name: 'Fatima Al-Rashid',  email: 'fatima@travel.com',    phone: '+971 50 123 4567', nationality: 'UAE',     role: 'user',  status: 'active',    joinDate: '2026-02-14', password: 'fatima123',image: 'https://randomuser.me/api/portraits/women/55.jpg' },
        { id: 'USR-005', name: 'Hans Müller',        email: 'hans@travel.com',      phone: '+49 30 1234567',   nationality: 'Germany', role: 'user',  status: 'active',    joinDate: '2026-03-01', password: 'hans123',  image: 'https://randomuser.me/api/portraits/men/62.jpg' },
        { id: 'USR-006', name: 'Yuki Tanaka',        email: 'yuki@travel.com',      phone: '+81 3 1234 5678',  nationality: 'Japan',   role: 'user',  status: 'active',    joinDate: '2026-03-18', password: 'yuki123',  image: 'https://randomuser.me/api/portraits/women/76.jpg' },
        { id: 'USR-007', name: 'Sofia Martínez',     email: 'sofia@travel.com',     phone: '+34 91 123 4567',  nationality: 'Spain',   role: 'user',  status: 'active',    joinDate: '2026-04-01', password: 'sofia123', image: 'https://randomuser.me/api/portraits/women/39.jpg' },
        { id: 'USR-008', name: 'James Okafor',       email: 'james@travel.com',     phone: '+234 80 1234 5678',nationality: 'Nigeria', role: 'user',  status: 'suspended', joinDate: '2026-04-10', password: 'james123', image: 'https://randomuser.me/api/portraits/men/81.jpg' },
        { id: 'ADM-001', name: 'Admin Operations',   email: 'admin@egypt.com',      phone: '+20 100 000 0001', nationality: 'Egypt',   role: 'admin', status: 'active',    joinDate: '2024-01-01', password: 'admin123', image: 'https://randomuser.me/api/portraits/men/91.jpg' },
        { id: 'ADM-002', name: 'Sara El-Masry',      email: 'sara@pyramids.com',    phone: '+20 100 987 6543', nationality: 'Egypt',   role: 'admin', status: 'active',    joinDate: '2024-08-01', password: 'sara123',  image: 'https://randomuser.me/api/portraits/women/33.jpg' },
        { id: 'ADM-003', name: 'Karim Hassan',       email: 'karim@pyramids.com',   phone: '+20 100 123 4567', nationality: 'Egypt',   role: 'admin', status: 'active',    joinDate: '2024-06-15', password: 'karim123', image: 'https://randomuser.me/api/portraits/men/41.jpg' }
    ],





    supportTickets: [
        { id: "TK-001", subject: "Booking confirmation not received", customer: "Emily Carter", email: "emily@travel.com", priority: "high", status: "open", category: "Booking", createdAt: "2026-04-18", message: "I completed my booking 2 days ago but haven't received any confirmation email." },
        { id: "TK-002", subject: "Request for itinerary change", customer: "Liam O'Brien", email: "liam@travel.com", priority: "medium", status: "in-progress", category: "Trip", createdAt: "2026-04-17", message: "I'd like to swap Abu Simbel for an extra day in Luxor." },
        { id: "TK-003", subject: "Wheelchair accessibility query", customer: "Hans Müller", email: "hans@travel.com", priority: "high", status: "open", category: "Access", createdAt: "2026-04-19", message: "Can you confirm wheelchair access for the Pyramids tour?" },
        { id: "TK-004", subject: "Payment refund request", customer: "Yuki Tanaka", email: "yuki@travel.com", priority: "high", status: "open", category: "Payment", createdAt: "2026-04-20", message: "I need a refund for my cancelled Sinai trip." },
        { id: "TK-005", subject: "Hotel room upgrade inquiry", customer: "Ahmed Traveler", email: "user@egypt.com", priority: "low", status: "resolved", category: "Hotel", createdAt: "2026-04-15", message: "Is it possible to upgrade to a Nile-view suite?" },
        { id: "TK-006", subject: "Guide language preference", customer: "Fatima Al-Rashid", email: "fatima@travel.com", priority: "medium", status: "resolved", category: "Guide", createdAt: "2026-04-14", message: "Can I request an Arabic-speaking guide for my Luxor tour?" },
        { id: "TK-007", subject: "Lost luggage during transfer", customer: "Emily Carter", email: "emily@travel.com", priority: "high", status: "in-progress", category: "Transport", createdAt: "2026-04-19", message: "My suitcase was left behind during the airport transfer." },
        { id: "TK-008", subject: "Photo package add-on", customer: "Liam O'Brien", email: "liam@travel.com", priority: "low", status: "open", category: "General", createdAt: "2026-04-20", message: "Do you offer a professional photography package?" }
    ],

















    bookings: [
        { id: 'BK-001', bookingNumber: 'EG-2026-0001', userId: 'USR-001', userName: 'Ahmed Traveler', packageId: 'pkg-1', packageName: 'Giza Horizons: Wonders & Secrets', startDate: '2026-05-15', endDate: '2026-05-15', travelers: 2, totalPrice: 9000, status: 'confirmed', createdAt: '2026-04-10' },
        { id: 'BK-002', bookingNumber: 'EG-2026-0002', userId: 'USR-002', userName: 'Emily Carter', packageId: 'pkg-week-1', packageName: 'Timeless Egypt: Grand Expedition', startDate: '2026-06-01', endDate: '2026-06-07', travelers: 2, totalPrice: 250000, status: 'confirmed', createdAt: '2026-04-12' },
        { id: 'BK-003', bookingNumber: 'EG-2026-0003', userId: 'USR-003', userName: "Liam O'Brien", packageId: 'pkg-2', packageName: 'Nile Twilight: Heritage Dinner', startDate: '2026-05-20', endDate: '2026-05-20', travelers: 4, totalPrice: 32000, status: 'confirmed', createdAt: '2026-04-15' },
        { id: 'BK-004', bookingNumber: 'EG-2026-0004', userId: 'USR-004', userName: 'Fatima Al-Rashid', packageId: 'pkg-3', packageName: 'Luxor Echoes: Valley of Kings', startDate: '2026-07-10', endDate: '2026-07-10', travelers: 1, totalPrice: 15500, status: 'confirmed', createdAt: '2026-04-18' },
        { id: 'BK-005', bookingNumber: 'EG-2026-0005', userId: 'USR-005', userName: 'Hans Müller', packageId: 'pkg-week-2', packageName: 'Red Sea Soul & Sinai Heights', startDate: '2026-08-05', endDate: '2026-08-12', travelers: 2, totalPrice: 220000, status: 'confirmed', createdAt: '2026-04-08' },
        { id: 'BK-006', bookingNumber: 'EG-2026-0006', userId: 'USR-006', userName: 'Yuki Tanaka', packageId: 'pkg-4', packageName: 'Alexandria: Pearl of the Mediterranean', startDate: '2026-05-25', endDate: '2026-05-25', travelers: 3, totalPrice: 12500, status: 'confirmed', createdAt: '2026-03-20' },
        { id: 'BK-007', bookingNumber: 'EG-2026-0007', userId: 'USR-001', userName: 'Ahmed Traveler', packageId: 'pkg-5', packageName: 'Islamic Cairo: City of a Thousand Minarets', startDate: '2026-04-10', endDate: '2026-04-10', travelers: 1, totalPrice: 4500, status: 'confirmed', createdAt: '2026-03-28' },
        { id: 'BK-008', bookingNumber: 'EG-2026-0008', userId: 'USR-002', userName: 'Emily Carter', packageId: 'pkg-week-3', packageName: "Pharaoh's Legacy: Complete Egypt", startDate: '2026-09-01', endDate: '2026-09-10', travelers: 2, totalPrice: 290000, status: 'confirmed', createdAt: '2026-04-21' }
    ],




    websiteReviews: [
        { id: 'REV-001', user: 'Ahmed Traveler', rating: 5, title: 'Unforgettable Experience', review: 'The Giza tour exceeded every expectation. Our Egyptologist was incredibly knowledgeable.', date: '2026-04-12', packageName: 'Giza Horizons' },
        { id: 'REV-002', user: 'Emily Carter', rating: 5, title: 'Trip of a Lifetime', review: 'The 7-day expedition was flawlessly organized. Every hotel and transfer was premium quality.', date: '2026-04-14', packageName: 'Timeless Egypt' },
        { id: 'REV-003', user: 'Yuki Tanaka', rating: 4, title: 'Beautiful Alexandria', review: 'Loved the Bibliotheca and the seafood lunch. Would have liked more free time at Qaitbay.', date: '2026-04-01', packageName: 'Alexandria' },
        { id: 'REV-004', user: 'Fatima Al-Rashid', rating: 5, title: 'Magic on the Nile', review: 'The sunset dinner cruise was pure magic. The Sufi performance brought tears to my eyes.', date: '2026-03-25', packageName: 'Nile Twilight' },
        { id: 'REV-005', user: 'Hans Müller', rating: 4, title: 'Great Value for Sinai', review: 'The Red Sea diving was world-class. Mount Sinai sunrise was spiritual. Minor logistics hiccup on Day 4.', date: '2026-03-15', packageName: 'Red Sea Soul' },
        { id: 'REV-006', user: "Liam O'Brien", rating: 5, title: 'Khan El Khalili Was Amazing', review: 'Islamic Cairo tour was a hidden gem. The guide knew every back alley and the tea house was a highlight.', date: '2026-04-18', packageName: 'Islamic Cairo' },
        { id: 'REV-007', user: 'Emily Carter', rating: 5, title: 'Already Planning My Return', review: 'Beyond the Pyramids has ruined all other travel agencies for me. The attention to detail is extraordinary.', date: '2026-04-20', packageName: 'General' },
        { id: 'REV-008', user: 'Ahmed Traveler', rating: 4, title: 'Luxor Never Gets Old', review: 'Third time visiting Luxor and this tour showed me tombs I never knew existed. Karnak at dawn is a must.', date: '2026-04-05', packageName: 'Luxor Echoes' }
    ],




    employees: [
        { id: 'EMP-1001', name: 'Karim Hassan', role: 'Planner', email: 'karim@pyramids.com', phone: '+20 100 123 4567', hireDate: '2024-06-15', dob: '1990-03-22', address: '15 Tahrir St, Cairo', username: 'karim.h', password: 'pass123', languages: '', specialization: 'Luxury Itineraries' },
        { id: 'EMP-1002', name: 'Sara El-Masry', role: 'Booking Manager', email: 'sara@pyramids.com', phone: '+20 100 987 6543', hireDate: '2024-08-01', dob: '1992-07-10', address: '8 Zamalek Ave, Cairo', username: 'sara.m', password: 'pass123', languages: '', specialization: 'Group Bookings' },
        { id: 'EMP-1004', name: 'Nour Abdallah', role: 'Customer Support', email: 'nour@pyramids.com', phone: '+20 112 333 4444', hireDate: '2025-01-10', dob: '1995-02-18', address: '3 Mohandessin, Giza', username: 'nour.a', password: 'pass123', languages: '', specialization: 'Complaint Resolution' },
        { id: 'EMP-1007', name: 'Dina Mahmoud', role: 'Planner', email: 'dina@pyramids.com', phone: '+20 112 777 8888', hireDate: '2025-03-15', dob: '1993-12-05', address: '7 Heliopolis, Cairo', username: 'dina.m', password: 'pass123', languages: '', specialization: 'Custom Trips' },
        { id: 'EMP-1009', name: 'Mariam Sayed', role: 'Booking Manager', email: 'mariam@pyramids.com', phone: '+20 111 999 0000', hireDate: '2025-04-01', dob: '1994-08-25', address: '6 Dokki, Giza', username: 'mariam.s', password: 'pass123', languages: '', specialization: 'VIP Concierge' },
        { id: 'EMP-1010', name: 'Tamer Khaled', role: 'Customer Support', email: 'tamer@pyramids.com', phone: '+20 112 000 1111', hireDate: '2025-04-10', dob: '1996-01-30', address: '19 Nasr City, Cairo', username: 'tamer.k', password: 'pass123', languages: '', specialization: 'Technical Support' }
    ],


    permissionsStore: {
        'Planner': ['Create trips', 'Modify packages', 'View reports', 'Manage itineraries'],
        'Booking Manager': ['Cancel bookings', 'Process refunds', 'View customer data'],
        'Customer Support': ['View tickets', 'Respond to tickets', 'Escalate issues', 'View customer profiles'],
        'Admin': ['Full System Control']
    },

    packages: [
        {
            id: 'PKG-001',
            type: 'single',
            name: 'Great Pyramid of Giza',
            city: 'Giza',
            description: 'Stand before one of the Seven Wonders of the Ancient World. Explore the legendary Pyramid of Khufu, the Sphinx, and the Valley Temple with an expert Egyptologist guide.',
            image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&q=80',
            price: 4500,
            discountedPrice: 3800,
            status: 'active',
            rating: 4.9,
            reviews: 312,
            openingHours: '8:00 AM - 5:00 PM',
            closingDays: 'None',
            recommendedDuration: 4,
            guidedTour: 'yes'
        },
        {
            id: 'PKG-002',
            type: 'single',
            name: 'Karnak Temple Complex',
            city: 'Luxor',
            description: 'Walk through the vast temple complex dedicated to Amun-Ra. Marvel at the Great Hypostyle Hall with its 134 massive columns and the sacred lake that has stood for 3,000 years.',
            image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&q=80',
            price: 3200,
            discountedPrice: null,
            status: 'active',
            rating: 4.8,
            reviews: 214,
            openingHours: '6:00 AM - 6:00 PM',
            closingDays: 'None',
            recommendedDuration: 3,
            guidedTour: 'yes'
        },
        {
            id: 'PKG-003',
            type: 'single',
            name: 'Alexandria Royal Library',
            city: 'Alexandria',
            description: 'Visit the modern revival of the legendary Ancient Library of Alexandria. Housing over 8 million volumes and hosting world-class museums and planetarium exhibitions.',
            image: 'https://images.unsplash.com/photo-1568322445389-f64ac2515099?w=800&q=80',
            price: 2500,
            discountedPrice: 1950,
            status: 'active',
            rating: 4.6,
            reviews: 98,
            openingHours: '9:00 AM - 7:00 PM',
            closingDays: 'Friday',
            recommendedDuration: 2,
            guidedTour: 'yes'
        },
        {
            id: 'PKG-004',
            type: 'day',
            name: 'Cairo Highlights Day Tour',
            city: 'Cairo',
            description: 'An action-packed full-day tour covering the Egyptian Museum, the Citadel of Saladin, Khan El-Khalili Bazaar, and a traditional lunch on the Nile — all in one unforgettable day.',
            image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&q=80',
            price: 12500,
            discountedPrice: 9800,
            status: 'active',
            rating: 4.7,
            reviews: 187,
            duration: 10,
            languages: 'EN, AR, FR, DE',
            minGroup: 1,
            maxGroup: 12,
            includedServices: 'Expert Guide, A/C Transport, Entrance Fees, Lunch',
            itinerary: '[{"time":"08:00","activity":"Hotel Pickup"},{"time":"09:00","activity":"Egyptian Museum"},{"time":"12:00","activity":"Citadel of Saladin"},{"time":"14:00","activity":"Nile Lunch Cruise"},{"time":"16:00","activity":"Khan El-Khalili Bazaar"},{"time":"18:00","activity":"Hotel Drop-off"}]'
        },
        {
            id: 'PKG-005',
            type: 'day',
            name: 'Luxor East & West Bank',
            city: 'Luxor',
            description: 'Cross the Nile to discover the Valley of the Kings, the mortuary temple of Hatshepsut, and the Colossi of Memnon, before exploring Karnak Temple as the sun sets over the columns.',
            image: 'https://images.unsplash.com/photo-1604608672516-5a2b4ab5c31f?w=800&q=80',
            price: 15500,
            discountedPrice: 12500,
            status: 'active',
            rating: 4.9,
            reviews: 243,
            duration: 11,
            languages: 'EN, AR, IT, ES',
            minGroup: 2,
            maxGroup: 10,
            includedServices: 'Egyptologist Guide, Ferry Tickets, A/C Van, Entrance Fees, Bottled Water',
            itinerary: '[{"time":"07:00","activity":"Hotel Pickup"},{"time":"08:00","activity":"Valley of the Kings"},{"time":"11:00","activity":"Temple of Hatshepsut"},{"time":"13:00","activity":"Colossi of Memnon"},{"time":"15:00","activity":"Karnak Temple"},{"time":"18:00","activity":"Hotel Return"}]'
        },
        {
            id: 'PKG-006',
            type: 'day',
            name: 'Red Sea Snorkelling Adventure',
            city: 'Hurghada',
            description: 'Sail to the pristine coral reefs of Giftun Island for a full day of snorkelling, dolphin watching, and relaxing on white sandy beaches. Equipment and BBQ lunch included.',
            image: 'https://images.unsplash.com/photo-1682687218147-9806132dc697?w=800&q=80',
            price: 8500,
            discountedPrice: null,
            status: 'active',
            rating: 4.8,
            reviews: 156,
            duration: 8,
            languages: 'EN, AR, RU',
            minGroup: 4,
            maxGroup: 20,
            includedServices: 'Speedboat, Snorkelling Gear, Life Jacket, BBQ Lunch, Soft Drinks',
            itinerary: '[{"time":"09:00","activity":"Marina Departure"},{"time":"10:00","activity":"Giftun Island Snorkelling"},{"time":"13:00","activity":"BBQ Lunch on Beach"},{"time":"15:00","activity":"Dolphin Watching"},{"time":"17:00","activity":"Return to Marina"}]'
        },
        {
            id: 'PKG-007',
            type: 'week',
            name: 'Complete Egypt Discovery',
            city: 'Cairo',
            description: 'The ultimate Egypt experience. 7 days covering Cairo, Giza, Luxor, and Aswan. Fly over Abu Simbel at dawn, cruise the Nile on a traditional felucca, and sleep in 5-star Nile-view hotels.',
            image: 'https://images.unsplash.com/photo-1585874341047-b5254dc5d8a8?w=800&q=80',
            price: 125000,
            discountedPrice: 110000,
            status: 'active',
            rating: 5.0,
            reviews: 89,
            durationDays: 7,
            nights: 6,
            accommodationIncluded: 'yes',
            hotelName: 'Marriott Mena House & Sofitel Winter Palace',
            dailyItinerary: '[{"day":1,"title":"Cairo Arrival & Pyramids"},{"day":2,"title":"Egyptian Museum & Old Cairo"},{"day":3,"title":"Fly to Luxor — East Bank"},{"day":4,"title":"Luxor West Bank & Valley of the Kings"},{"day":5,"title":"Sail to Aswan — Edfu & Kom Ombo"},{"day":6,"title":"Abu Simbel Day Trip"},{"day":7,"title":"Aswan Departure"}]'
        },
        {
            id: 'PKG-008',
            type: 'week',
            name: 'Nile Cruise & Siwa Oasis',
            city: 'Aswan',
            description: 'A rare 8-day journey combining a luxury Nile cruise from Aswan to Luxor with a 2-night desert escape to the magical Siwa Oasis — home of Alexander the Great\'s Oracle Temple.',
            image: 'https://images.unsplash.com/photo-1601897935844-f1432e0e4a5e?w=800&q=80',
            price: 145000,
            discountedPrice: null,
            status: 'active',
            rating: 4.9,
            reviews: 41,
            durationDays: 8,
            nights: 7,
            accommodationIncluded: 'yes',
            hotelName: 'MS Sanctuary Sun Boat IV & Shali Lodge',
            dailyItinerary: '[{"day":1,"title":"Aswan & Philae Temple"},{"day":2,"title":"Abu Simbel & Cruise Embarkation"},{"day":3,"title":"Kom Ombo & Edfu Temples"},{"day":4,"title":"Luxor West Bank"},{"day":5,"title":"Karnak & Fly to Cairo"},{"day":6,"title":"Drive to Siwa Oasis"},{"day":7,"title":"Siwa Exploration"},{"day":8,"title":"Return & Departure"}]'
        },
        {
            id: 'PKG-009',
            type: 'single',
            name: 'Abu Simbel Temples',
            city: 'Aswan',
            description: 'Witness the colossal rock-cut temples of Ramesses II relocated to save them from the rising Nile. Arrive at sunrise when the light illuminates the inner sanctuary in a spectacular solar alignment.',
            image: 'https://images.unsplash.com/photo-1565000546955-6ed8d56b8d7b?w=800&q=80',
            price: 5500,
            discountedPrice: 4800,
            status: 'active',
            rating: 4.9,
            reviews: 178,
            openingHours: '6:00 AM - 5:00 PM',
            closingDays: 'None',
            recommendedDuration: 3,
            guidedTour: 'yes'
        }
    ]
};
