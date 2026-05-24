window.AppStorage = {
    
    
    
    getItem: function(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    },
    setItem: function(key, val) {
        try { localStorage.setItem(key, val); } catch (e) {}
    },
    removeItem: function(key) {
        try { localStorage.removeItem(key); } catch (e) {}
    },
    getSessionItem: function(key) {
        try { return sessionStorage.getItem(key); } catch (e) { return null; }
    },
    setSessionItem: function(key, val) {
        try { sessionStorage.setItem(key, val); } catch (e) {}
    },
    removeSessionItem: function(key) {
        try { sessionStorage.removeItem(key); } catch (e) {}
    },

    
    
    
    getTheme: function() {
        return this.getItem('theme');
    },
    setTheme: function(theme) {
        this.setItem('theme', theme);
    },

    
    
    
    isLoggedIn: function() {
        return this.getItem('isLoggedIn') === 'true';
    },
    setLoggedIn: function(status) {
        this.setItem('isLoggedIn', status);
    },
    getCurrentUser: function() {
        const u = this.getItem('beyondPyramids_currentUser');
        return u ? JSON.parse(u) : null;
    },
    setCurrentUser: function(user) {
        if(user) this.setItem('beyondPyramids_currentUser', JSON.stringify(user));
        else this.removeItem('beyondPyramids_currentUser');
    },
    clearCurrentUser: function() {
        this.removeItem('isLoggedIn');
        this.removeItem('beyondPyramids_currentUser');
    },
    getCurrentUserRole: function() {
        return this.getItem('currentUserRole');
    },
    setCurrentUserRole: function(role) {
        this.setItem('currentUserRole', role);
    },
    getUsers: function() {
        const users = this.getItem('beyondPyramids_users');
        return users ? JSON.parse(users) : [];
    },
    setUsers: function(users) {
        this.setItem('beyondPyramids_users', JSON.stringify(users));
    },

    
    
    
    getUserSession: function() {
        const session = this.getItem('userSession') || this.getSessionItem('userSession');
        return session ? JSON.parse(session) : null;
    },
    setUserSessionLocal: function(data) {
        this.setItem('userSession', JSON.stringify(data));
    },
    setUserSessionSession: function(data) {
        this.setSessionItem('userSession', JSON.stringify(data));
    },
    clearUserSession: function() {
        this.removeItem('userSession');
        this.removeSessionItem('userSession');
    },

    
    
    
    getBookings: function() {
        const b = this.getItem('beyondPyramids_bookings');
        return b ? JSON.parse(b) : [];
    },
    setBookings: function(bookings) {
        this.setItem('beyondPyramids_bookings', JSON.stringify(bookings));
    },
    getCurrentBooking: function() {
        const cb = this.getItem('currentBooking');
        return cb ? JSON.parse(cb) : null;
    },
    setCurrentBooking: function(booking) {
        this.setItem('currentBooking', JSON.stringify(booking));
    },
    getDraft: function() {
        const draft = this.getItem('btp_draft');
        return draft ? JSON.parse(draft) : null;
    },
    setDraft: function(draft) {
        this.setItem('btp_draft', JSON.stringify(draft));
    },
    clearDraft: function() {
        this.removeItem('btp_draft');
    },

    
    
    
    getTransportVehicles: function() {
        const v = this.getItem('transport_vehicles');
        return v ? JSON.parse(v) : null;
    },
    setTransportVehicles: function(vehicles) {
        this.setItem('transport_vehicles', JSON.stringify(vehicles));
    },
    getTransportDrivers: function() {
        const d = this.getItem('transport_drivers');
        return d ? JSON.parse(d) : null;
    },
    setTransportDrivers: function(drivers) {
        this.setItem('transport_drivers', JSON.stringify(drivers));
    },
    getTransportBookings: function() {
        const b = this.getItem('transport_bookings');
        return b ? JSON.parse(b) : null;
    },
    setTransportBookings: function(bookings) {
        this.setItem('transport_bookings', JSON.stringify(bookings));
    },

    
    
    
    getTermsAccepted: function() {
        return this.getItem('termsAccepted') === 'true';
    },
    setTermsAccepted: function(isAccepted) {
        this.setItem('termsAccepted', isAccepted ? 'true' : 'false');
    },

    // --- Package Management ---
    getPackages: function() {
        const p = this.getItem('beyondPyramids_packages');
        if (p) return JSON.parse(p);
        // Fallback to MockData if available
        if (window.MockData && window.MockData.packages) {
            return window.MockData.packages;
        }
        return [];
    },
    setPackages: function(packages) {
        this.setItem('beyondPyramids_packages', JSON.stringify(packages));
    },

    // ─── Registered Users (persistent localStorage store) ─────────────────
    // Stores users created through the registration form.
    // Each entry: { id, name, email, password, phone, nationality, dob,
    //               role, dashboard, joinDate, image, bookings[] }

    getRegisteredUsers: function() {
        const raw = this.getItem('bp_registered_users');
        return raw ? JSON.parse(raw) : [];
    },

    saveRegisteredUser: function(user) {
        const users = this.getRegisteredUsers();
        const existingIdx = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
        if (existingIdx >= 0) {
            users[existingIdx] = { ...users[existingIdx], ...user };
        } else {
            users.push(user);
        }
        this.setItem('bp_registered_users', JSON.stringify(users));
    },

    updateRegisteredUser: function(email, updates) {
        const users = this.getRegisteredUsers();
        const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
        if (idx >= 0) {
            users[idx] = { ...users[idx], ...updates };
            this.setItem('bp_registered_users', JSON.stringify(users));
            return users[idx];
        }
        return null;
    },

    // Search registered users first, then MockData.users
    getUserByEmail: function(email) {
        if (!email) return null;
        const lower = email.toLowerCase();
        const registered = this.getRegisteredUsers();
        const regMatch = registered.find(u => u.email.toLowerCase() === lower);
        if (regMatch) return regMatch;
        if (window.MockData && window.MockData.users) {
            const mockUser = window.MockData.users.find(u => u.email.toLowerCase() === lower);
            if (mockUser) return mockUser;
        }
        return null;
    },

    // ─── Per-user Booking History ──────────────────────────────────────────
    _bookingKey: function(email) {
        return 'bp_bookings_' + (email || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
    },

    getUserBookings: function(email) {
        if (!email) return [];
        const raw = this.getItem(this._bookingKey(email));
        let stored = raw ? JSON.parse(raw) : [];
        // Also pull MockData bookings for this user
        if (window.MockData && window.MockData.bookings && window.MockData.users) {
            const mockUserObj = window.MockData.users.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (mockUserObj) {
                const mock = window.MockData.bookings.filter(b => b.userId === mockUserObj.id);
                mock.forEach(mb => {
                    if (!stored.some(s => s.id === mb.id)) stored.push(mb);
                });
            }
        }
        return stored;
    },

    addBookingToUserHistory: function(email, booking) {
        if (!email || !booking) return;
        const key = this._bookingKey(email);
        const existing = this.getItem(key);
        let bookings = existing ? JSON.parse(existing) : [];
        if (!bookings.some(b => b.id === booking.id)) {
            bookings.unshift(booking);
        }
        this.setItem(key, JSON.stringify(bookings));
        // Also update the registered user's bookings array
        const users = this.getRegisteredUsers();
        const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
        if (idx >= 0) {
            if (!users[idx].bookings) users[idx].bookings = [];
            if (!users[idx].bookings.some(b => b.id === booking.id)) {
                users[idx].bookings.unshift(booking);
            }
            this.setItem('bp_registered_users', JSON.stringify(users));
        }
    },

    updateUserBooking: function(email, bookingId, updates) {
        if (!email || !bookingId) return;
        const key = this._bookingKey(email);
        const existing = this.getItem(key);
        if (existing) {
            let bookings = JSON.parse(existing);
            const idx = bookings.findIndex(b => b.id === bookingId || b.bookingId === bookingId || b.bookingNumber === bookingId);
            if (idx >= 0) {
                bookings[idx] = { ...bookings[idx], ...updates };
                this.setItem(key, JSON.stringify(bookings));
            }
        }
        
        // Also update in registered user's array
        const users = this.getRegisteredUsers();
        const uIdx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
        if (uIdx >= 0 && users[uIdx].bookings) {
            const bIdx = users[uIdx].bookings.findIndex(b => b.id === bookingId || b.bookingId === bookingId || b.bookingNumber === bookingId);
            if (bIdx >= 0) {
                users[uIdx].bookings[bIdx] = { ...users[uIdx].bookings[bIdx], ...updates };
                this.setItem('bp_registered_users', JSON.stringify(users));
            }
        }
    }
};
