" ------- "
" General "
" ------- "

let mapleader=" "				" leader
set nocompatible				" allows for vim specific navigation
set encoding=utf-8
set pastetoggle=<F2>				" toggle to paste mode when using auto indent
set viminfo=""
set backspace=indent,eol,start			" fixes for backspace bugs

" mouse controls
set mouse=a
set scrolloff=5

" guide navigation (wordt niet zo veel gebuirkt)
inoremap <Space><Tab> <Esc>/<++><Enter>"_c4l
vnoremap <Space><Tab> <Esc>/<++><Enter>"_c4l
map <Space><Tab> <Esc>/<++><Enter>"_c4l

" spellcheck
map <F6> :setlocal spell! spelllang=nl,en<CR>
inoremap <F6> <Esc>:setlocal spell! spelllang=nl,en<CR>a
inoremap ,p <Esc>[sz=a
inoremap ,n <Esc>]sz=a

" search functions
set hlsearch
set incsearch
set ignorecase
set smartcase

" settings indentations
set autoindent
set expandtab
set tabstop=4
set shiftwidth=4

" clipboard link
set clipboard=unnamedplus


" --------------- "
" Install plugins "
" --------------- "

filetype off
set rtp+=~/.vim/bundle/Vundle.vim
call vundle#begin()

" required for vundle management
Plugin 'VundleVim/Vundle.vim'

" installed plugins
Plugin 'tpope/vim-fugitive'
Plugin 'lervag/vimtex'
Plugin 'ycm-core/YouCompleteMe'
Plugin 'preservim/nerdtree'
Plugin 'itchyny/lightline.vim'
Plugin 'Yggdroot/indentLine'

call vundle#end()
filetype plugin indent on


" ------ "
" visual "
" ------ "

set number
set showcmd					" show partial commands
set showmode					" show mode you are in

" highlighting
syntax on
set showmatch

" statusbar setup (lightline)
set laststatus=2
let g:lightline = {
    \ 'colorscheme': 'deus',
    \ 'active': {
    \   'left': [ [ 'mode', 'paste' ],
    \             [ 'gitbranch', 'readonly', 'filename', 'modified' ] ]
    \ },
    \ 'component_function': {
    \   'gitbranch': 'FugitiveHead'
    \ },
    \ }


" --------- "
" file tree "
" --------- "

autocmd StdinReadPre * let s:std_in=1
autocmd VimEnter * if argc() == 0 && !exists("s:std_in") | NERDTree | endif
map <C-n> :NERDTreeToggle<CR>

" ---------------------- "
" settings individual ft "
" ---------------------- "

" Python
au FileType python map <F5> :w<Enter>:!time<space>python<space>%<Enter>
au FileType python inoremap <F5> <Esc>:w<Enter>:!time<space>python<space>%<Enter>a
let g:jedi#auto_close_doc = 1  			" close preview window after completion

" Latex
map la :read<space>~/.vim/startup-files/config.tex<Enter>:1<Enter>dd:w<Enter>:edit<Enter>:23<Enter>f}i
let g:tex_flavor='latex'			" used by vimtex
au FileType tex map <F5> :w<Enter>:!lualatex<space>%<Enter>:!biber<space>%:r<Enter>:!lualatex<space>%<Enter>:!lualatex<space>%<Enter>
au FileType tex inoremap <F5> <Esc>:w<Enter>:!lualatex<space>%<Enter>:!biber<space>%:r<Enter>:!lualatex<space>%<Enter>:!lualatex<space>%<Enter>a
au FileType tex inoremap ,eq \begin{equation}<Enter><Enter>\end{equation}<Enter><++><Esc>2ki
au FileType tex inoremap ,eqm \begin{equation}<Enter>\begin{aligned}<Enter><Enter>\end{aligned}<Enter>\end{equation}<Enter><++><Esc>3ki
au FileType tex inoremap ,se \section{<++>}<Enter><++><Esc>1k0fsi
au FileType tex inoremap ,fr \frac{}{<++>}<++><Esc>0f}i
au FileType tex inoremap ,fi \begin{figure}[H]<Enter>\centering<Enter>\includegraphics[width=\textwidth]{}<Enter>\caption{<++>}<Enter>\label{<++>}<Enter>\end{figure}\noindent<Esc>3k0f}i
au FileType tex inoremap ,it \begin{itemize}<Enter><Enter>\end{itemize}<Esc>1kA\item
au FileType tex inoremap ,fm \begin{figure}[ht]<Enter>\centering<Enter>\subfloat[]{<Enter>\includegraphics[width=0.4\textwidth]{<++>}<Enter>\label{<++>}<Enter>}<Enter>\hfill<Enter>\subfloat[<++>]{<Enter>\includegraphics[width=0.4\textwidth]{<++>}<Enter>\label{<++>}<Enter>}<Enter>\end{figure}\noindent<Esc>9k0f]i
autocmd BufNewFile,BufRead *.cls set filetype=tex " syntax needs to be same ass tex for cls


" c++
au FileType cpp setlocal cindent
au FileType h setlocal cindent
au FileType cpp map <F5> :w<Enter>:!g++<space>-std=c++11<space>-Wall<space>-O3<space>-o<space>%:r<space>%<Enter>
au FileType cpp inoremap <F5> <Esc>:w<Enter>:!g++<space>-std=c++11<space>-Wall<space>-O3<space>-o<space>%:r<space>%<Enter>a
au FileType cpp map <F4> :!./%:r<Enter>
au FileType cpp inoremap <F4> <Esc>:!./%:r<Enter>a
au FileType cpp inoremap ,cl (<++>)<Enter>{<Enter><++><Enter>}<Enter><++><Esc>4k0f(i
au FileType cpp inoremap ,for for<space>()<Enter>{<Enter><++><Enter>}<Enter><++><Esc>4k0f)i

" c
au FileType c setlocal cindent
au FileType h setlocal cindent
au FileType c inoremap ,c /*<space>(eigen toevoegingen, tag=own)<space>*/<Esc>0f/f)a<space>
