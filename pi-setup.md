# Raspberry Pi Setup

-   Install Raspberry Pi OS to SD card using Raspberry Pi Imager
-   Run `sudo raspi-config` on pi - Change user password - Set locale (For me, from en_GB. UTF-8 ; to en_US. UTF-8) - Set time zone (For me, to America->Chicago) - Set keyboard (For me, Generic 104-key PC -> Other -> English (US) ) - \*Set SSH (Interfacing Options -> SSH -> Yes)
-   \*Set up SSH: - `ssh-keygen` - ssh in - `nano .ssh/authorized_keys`, paste public key from the account you are accessing from (`~/.ssh/id_rsa.pub`), save - on accessing account, add entry to ~/.ssh/config with correct Host (name to use to access this pi) and HostName (ip address of the pi) and User (username on pi)
-   Add Node repo, using "curl" command from Ubuntu instructions on [node.dev/node-binary](https://node.dev/node-binary)
-   Update pi software: `sudo apt update && sudo apt full-upgrade -y`
-   Install Node on pi: `sudo apt install -y nodejs`
-   Install git: - `sudo apt install -y git` - `git config --global user.email "<github email address>"` - `git config --global user.name "<name>"`
-   Pull from github: `git clone https://github.com/markschwartzkopf/pi-lightboard`
-   Build: - `npm install` - `npm install --production=false` - `npm run build`
    -   To be added to this .md
-   Install pm2: `sudo npm install pm2 -g` - To be added to this .md: setup pm2
