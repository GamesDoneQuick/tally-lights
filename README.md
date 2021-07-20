# tally-lights

> Firmware for our in-house tally light system. Jointly created by Tip of the Hats and Games Done Quick.

## Deployment on Pi

-   Install Raspberry Pi OS to SD card using Raspberry Pi Imager
-   Run `sudo raspi-config` on pi
    -   Change user password
    -   Set locale (For me, from en_GB. UTF-8 ; to en_US. UTF-8)
    -   Set time zone (For me, to America->Chicago)
    -   Set keyboard (For me, Generic 104-key PC -> Other -> English (US) )
    -   Set SSH (Interfacing Options -> SSH -> Yes)
    -   Set up wireless LAN and connect to a wifi network with internet
-   Set up SSH:
    -   `ssh-keygen`
    -   ssh in
    -   `nano ~/.ssh/authorized_keys`, paste public key from the account you are accessing from (`~/.ssh/id_rsa.pub`), save
    -   on accessing account, add entry to ~/.ssh/config with correct Host (name to use to access this pi) and HostName (ip address of the pi) and User (username on pi)
-   Install Node for standard Pis:
    -   Add Node.js repo: `curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -`
    -   Install Node on pi: `sudo apt install -y nodejs`
-   Install Node for Pi Zeros:
    -   Manually download Node built for ARMv6: `wget https://unofficial-builds.nodejs.org/download/release/v14.17.3/node-v14.17.3-linux-armv6l.tar.xz`
        -   Other versions may be found here: `https://unofficial-builds.nodejs.org/download/release/`
    -   `tar xvfJ node-v14.17.3-linux-armv6l.tar.xz`
    -   `sudo cp -R node-v14.17.3-linux-armv6l/* /usr/local`
    -   Reboot `sudo shutdown -r now`
-   Update pi software: `sudo apt update && sudo apt full-upgrade -y`
-   For base station only, set up wireless hotspot:

    -   `sudo apt install hostapd`
    -   `sudo systemctl unmask hostapd`
    -   `sudo systemctl enable hostapd`
    -   `sudo apt install dnsmasq`
    -   `sudo nano /etc/dhcpcd.conf` and add:

            interface wlan0
            static ip_address=192.168.1.1/24
            nohook wpa_supplicant

    -   `sudo mv /etc/dnsmasq.conf /etc/dnsmasq.conf.orig`
    -   `sudo nano /etc/dnsmasq.conf` and paste in:

            interface=wlan0
            dhcp-range=192.168.1.2,192.168.1.20,255.255.255.0,24h

    -   `sudo nano /etc/hostapd/hostapd.conf` and paste in:

            interface=wlan0
            ssid=TallyNet
            hw_mode=a
            channel=0
            macaddr_acl=0
            auth_algs=1
            ignore_broadcast_ssid=0
            wpa=2
            wpa_passphrase=TallyRania
            wpa_key_mgmt=WPA-PSK
            wpa_pairwise=TKIP
            rsn_pairwise=CCMP

-   Install and configure git:
    -   `sudo apt install -y git`
    -   `git config --global user.email "<github email address>"`
    -   `git config --global user.name "<name>"`
-   Pull tally-lights project from github: `git clone https://github.com/GamesDoneQuick/tally-lights.git`
-   Reboot `sudo shutdown -r now`
-   Build:
    -   `npm install --production=false`
        -   If there are errors, this may need to be run multiple times
    -   `npm run build`
-   Install pm2: `sudo npm install pm2 -g`
-   For tally-light pis:
    -   Setup to run pm2 from root (root privileges are needed to access GPIO)
        -   `pm2 kill`
        -   `sudo pm2 start api`
    -   `sudo pm2 start tally.config.js`
    -   `sudo pm2 save`
    -   `sudo pm2 startup`
-   For base-station pi:
    -   `pm2 start base.config.js`
    -   `pm2 save`
    -   `pm2 startup`
    -   Enter the command as prompted by pm2: `sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u pi --hp /home/pi`