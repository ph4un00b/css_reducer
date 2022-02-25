call plug#begin(stdpath('data') . '/plugged')

Plug 'mhartington/oceanic-next'
Plug 'neoclide/coc.nvim', {'branch': 'release'}
"Plug 'junegunn/fzf.vim', { 'do': { -> fzf#install() } }
"Plug 'leafgarland/typescript-vim'
Plug 'tpope/vim-sensible'

call plug#end()

set termguicolors
colorscheme OceanicNext

" https://github.com/neovim/neovim/wiki/FAQ#how-to-use-the-windows-clipboard-from-wsl
" to make Neovim use the system's (i.e Window's) clipboard by default.
set clipboard=unnamedplus

source .vim/coc.vim

set number
set ff=unix
