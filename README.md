
# THIS DOES NOT WORK YET

## Development

Install os dependencies:

- windows
  - golang
  - make (Optional)
  - msys2 https://www.msys2.org/
  - Open "MSYS2 MinGW 64-bit" and run: `pacman -Syu && pacman -S git mingw-w64-x86_64-toolchain`

- linux (debian/ubuntu)
  - `sudo apt-get install golang gcc libgl1-mesa-dev xorg-dev make`


Checkout source

    # New checkout
    git clone --recurse-submodules -j8 git://github.com/leighmacdonald/bd.git
    
    # (or) Existing repo and/or Old git version
    git clone git://github.com/leighmacdonald/bd.git
    cd bd && git submodule update --init --recursive


build
    
    make build_windows
